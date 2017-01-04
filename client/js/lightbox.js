import $ from 'jquery';
import InstagramImageSource from './InstagramImageSource';

// Interface to the underlying image API, in this case Instagram.
let imageSource = new InstagramImageSource();

// List of objects, each of which contains info on an image pulled from the global
// imageSource.
let imageInfo = [];

// Index of the object in imageInfo corresponding to the currently-displayed image.
let curImageIndex = -1;

if(imageSource.authorize()) {
	// NOTE we're not currently doing anything with the profile info we pull,
	// so I've commented out the request, but left it here for reference.
	Promise.all([
		// updateProfileInfo(),
		loadMoreImageDescriptions()
	]).then(() => {
		// An initial batch of image descriptions has been loaded. Display our
		// first photo (if one exists), and set up the UI.
		showNextPhoto();
		attachListeners();
	});
} else {
	// TODO show something useful if authorization fails.
	console.log('not authorized.');
}

function attachListeners() {
	$('a#next-link').click(e => {
		e.preventDefault();
		showNextPhoto();
	});

	$('a#prev-link').click(e => {
		e.preventDefault();
		showPrevPhoto();
	});
}

// NOTE Currently not used
function updateProfileInfo() {
	return imageSource.getProfileInfo()
	.then(result => {
		$('#user-name').text(result.name);
		$('#profile-picture').attr('src', result.profilePictureUrl);
	});
}

// Hide or reveal nav buttons as appropriate.
function updateNavButtons() {
	$('#prev-link').toggleClass('hide', curImageIndex === 0);
	$('#next-link').toggleClass('hide', curImageIndex >= imageInfo.length - 1);
}

// Request another page of image descriptions from our image source. We're not
// concerned with the number of images included per-page; we leave that up to
// the specifics of the image source implementation and the source API.
function loadMoreImageDescriptions() {
	if(!imageSource.canLoadMoreImages()) return Promise.resolve();

	// Grab another batch of image data from the image source
	return imageSource.getImages()
	.then(results =>{
		imageInfo = imageInfo.concat(results);
	});
}

// Displays the photo described at index (curImageIndex + 1) in imageInfo,
// updates navigation buttons as needed, and pre-loads the next image (which might
// involve pulling another page of image descriptions first).
function showNextPhoto() {
	Promise.resolve()
	.then(() => {
		if(curImageIndex < imageInfo.length - 1) {
			curImageIndex++;
			showImage(curImageIndex);
			updateNavButtons();
		}

		// If we have at least one more image in our cache, preload it
		if(curImageIndex < imageInfo.length - 2) {
			preloadImage(curImageIndex + 1);
		} else {
			// ...otherwise, ask our ImageSource for more data
			return loadMoreImageDescriptions()
			.then(() => {
				updateNavButtons();

				// Have to check our bounds again, as more image data may have
				// been added to imageInfo.
				if(curImageIndex < imageInfo.length - 1) {
					preloadImage(curImageIndex + 1);
				}
			});
		}
	});
}

function showPrevPhoto() {
	if(curImageIndex > 0) {
		curImageIndex--;

		showImage(curImageIndex);
		updateNavButtons();
	}
}

function showImage(index) {
	$('#focus-image').attr('src', imageInfo[index].image.standard.url);
	$('#image-description').text(imageInfo[index].caption);
}

// Load the image at the parameter index in imageInfo, but don't display it yet.
function preloadImage(index) {
	let imageDescription = imageInfo[index];

	if(!imageDescription.image.standard.downloaded) {
		imageDescription.image.standard.downloaded = new Image();
		imageDescription.image.standard.downloaded.src = imageDescription.image.standard.url;
	}
}
