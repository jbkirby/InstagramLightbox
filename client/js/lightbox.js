import $ from 'jquery';
import url from 'url';
import InstagramImageSource from './InstagramImageSource';

const INSTAGRAM_CLIENT_ID = '54cf06a9c7fa4584b9008927c8721b41';
const URL = url.parse(window.location.href);
const INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize/?client_id=' + INSTAGRAM_CLIENT_ID + '&redirect_uri=' + URL.href + '&response_type=token';

let imageSource = null;
let nextImageUrl = null;
let prevImageUrl = null;

if(URL.hash === null || !URL.hash.includes('#access_token=')) {
	// If no access token specified, redirect to instagram auth page
	window.location = INSTAGRAM_AUTH_URL;
} else {
	let accessToken = URL.hash.split('=')[1];
	console.log('access token is ' + accessToken);

	imageSource = new InstagramImageSource(accessToken);

	updateProfileInfo()
	.then(loadImages)
	.then(results => {
		console.log('results is ' + JSON.stringify(results, null, 4));
		// if(results.pagination) {
		// 	if(results.pagination.next_url) {
		// 		this.nextImageUrl = results.pagination.next_url;
		// 	}
		// }

		$('#focus_image').attr('src', results[0].image.standard.url);

		$('a#next_link').click(event => {
			event.preventDefault();

			if(nextImageUrl !== null) {

			};
		});

		$('a#prev_link').click(event => {
			event.preventDefault();

			if(prevImageUrl !== null) {

			};
		});

		// console.log('media query returned  ' + JSON.stringify(results, null, 4));
	});
}

function updateProfileInfo() {
	return imageSource.getProfileInfo()
	.then(result => {
		console.log('image source returned ' + JSON.stringify(result, null, 4));

		$('#user_name').text(result.name);
		$('#profile_picture').attr('src', result.profilePictureUrl);
	});
}

function loadImages() {
	return imageSource.getImages();
}

function showNextPhoto() {

}

function showPrevPhoto() {

}
