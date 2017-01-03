import $ from 'jquery';
import url from 'url';
import InstagramImageSource from './InstagramImageSource';

const INSTAGRAM_CLIENT_ID = '54cf06a9c7fa4584b9008927c8721b41';
const URL = url.parse(window.location.href);
const INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize/?client_id=' + INSTAGRAM_CLIENT_ID + '&redirect_uri=' + URL.href + '&response_type=token';

if(URL.hash === null || !URL.hash.includes('#access_token=')) {
	// If no access token specified, redirect to instagram auth page
	window.location = INSTAGRAM_AUTH_URL;
} else {
	let accessToken = URL.hash.split('=')[1];
	console.log('access token is ' + accessToken);

	let imageSource = new InstagramImageSource(accessToken);

	imageSource.getProfileInfo()
	.then(result => {
		console.log('image source returned ' + JSON.stringify(result, null, 4));

		$('#user_name').text(result.name);
		$('#profile_picture').attr('src', result.profilePictureUrl);

		return imageSource.getImages();
	})
	.then(results => {
		console.log('media query returned ' + JSON.stringify(results, null, 4));
	});
}
