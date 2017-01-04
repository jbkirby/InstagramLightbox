import $ from 'jquery';
import InstagramImageSource from './InstagramImageSource';

let imageSource = new InstagramImageSource();
let imageDataSoFar = [];
let curImageIndex = -1;

if(imageSource.authorize()) {
	Promise.all([
		updateProfileInfo(),
		loadMoreImageDescriptions()
	]).then(() => {
		showNextPhoto();
		attachListeners();
	});
} else {
	// TODO update page UI to indicate authorization failure
	console.log('not authorized.');
}

function attachListeners() {
	$('a#next_link').click(e => {
		e.preventDefault();
		showNextPhoto();
	});

	$('a#prev_link').click(e => {
		e.preventDefault();
		showPrevPhoto();
	});
}

function updateProfileInfo() {
	return imageSource.getProfileInfo()
	.then(result => {
		$('#user_name').text(result.name);
		$('#profile_picture').attr('src', result.profilePictureUrl);
	});
}

function updateNavButtons() {
	$('#prev_link').toggleClass('hide', curImageIndex === 0);
	$('#next_link').toggleClass('hide', curImageIndex >= imageDataSoFar.length - 1);
}

function loadMoreImageDescriptions() {
	if(!imageSource.canLoadMoreImages()) return Promise.resolve();

	console.log('loading more image data from API...');
	return imageSource.getImages()
	.then(results =>{
		imageDataSoFar = imageDataSoFar.concat(results);
	});
}

function showNextPhoto() {
	Promise.resolve()
	.then(() => {
		if(curImageIndex < imageDataSoFar.length - 1) {
			curImageIndex++;
			showImage(curImageIndex);
			updateNavButtons();
		}

		// If we have at least one more image in our cache, preload it
		if(curImageIndex < imageDataSoFar.length - 2) {
			preloadImage(curImageIndex + 1);
		} else {
			// ...otherwise, ask our ImageSource for more data
			return loadMoreImageDescriptions()
			.then(() => {
				updateNavButtons();

				if(curImageIndex < imageDataSoFar.length - 1) {
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
	$('#focus_image').attr('src', imageDataSoFar[index].image.standard.url);
	$('#image_description').text(imageDataSoFar[index].caption);
}

function preloadImage(index) {
	let imageDescription = imageDataSoFar[index];

	// If we haven't already downloaded the image at index, do it now.
	if(!imageDescription.image.standard.downloaded) {
		console.log('preloading ' + index);
		imageDescription.image.standard.downloaded = new Image();
		imageDescription.image.standard.downloaded.src = imageDescription.image.standard.url;
	}
}
