import $ from 'jquery';
import url from 'url';
import InstagramImageSource from './InstagramImageSource';

const INSTAGRAM_CLIENT_ID = '54cf06a9c7fa4584b9008927c8721b41';
const URL = url.parse(window.location.href);

// TODO move this into instagram module
const INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize/?client_id=' + INSTAGRAM_CLIENT_ID + '&redirect_uri=' + URL.href + '&response_type=token';

let imageDataSoFar = [];
let imageSource = null;
let curImageIndex = -1;

if(URL.hash === null || !URL.hash.includes('#access_token=')) {
	// If no access token specified, redirect to instagram auth page
	window.location = INSTAGRAM_AUTH_URL;
} else {
	let accessToken = URL.hash.split('=')[1];
	imageSource = new InstagramImageSource(accessToken);

	Promise.all([
		updateProfileInfo(),
		loadMoreImages()
	]).then(() => {
		attachListeners();
	});
}

function attachListeners() {
	$('a#next_link').click(event => {
		event.preventDefault();

		Promise.resolve()
		.then(() =>{
			if(curImageIndex === imageDataSoFar.length - 1) {
				console.log('loading more images...');
				return loadMoreImages();
			}
		})
		.then(() => {
			if(curImageIndex < imageDataSoFar.length - 1) {
				showPhoto(++curImageIndex);
			}
		});
	});

	$('a#prev_link').click(event => {
		event.preventDefault();

		if(curImageIndex > 0) {
			showPhoto(--curImageIndex);
		}
	});
}

function updateProfileInfo() {
	return imageSource.getProfileInfo()
	.then(result => {
		$('#user_name').text(result.name);
		$('#profile_picture').attr('src', result.profilePictureUrl);
	});
}

function loadMoreImages() {
	// If we don't have a URL from which to load more images, nothing to do.
	if(!imageSource.canLoadMoreImages()) return Promise.resolve();

	return imageSource.getImages()
	.then(results =>{
		imageDataSoFar = imageDataSoFar.concat(results);

		if(curImageIndex < 0 && imageDataSoFar.length > 0) {
			// Display the first image
			curImageIndex = 0;
			showPhoto(curImageIndex);
		}
	});
}

function showPhoto(index) {
	$('#focus_image').attr('src', imageDataSoFar[index].image.standard.url);
	$('#image_description').text(imageDataSoFar[index].caption);
}
