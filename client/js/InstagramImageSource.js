import $ from 'jquery';
import url from 'url';
import ImageSource from './ImageSource';

// TODO move this to an environment variable
const INSTAGRAM_CLIENT_ID = '54cf06a9c7fa4584b9008927c8721b41';

const NUM_IMAGES_TO_REQUEST = 5;

export default class InstagramImageSource extends ImageSource {
	constructor() {
		super();
		this.accessToken = null;
		this.nextPageUrl = null;
	}

	authorize() {
		const URL = url.parse(window.location.href);
		const INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize/?client_id='+ INSTAGRAM_CLIENT_ID
									+ '&redirect_uri=' + URL.href
									+ '&response_type=token';

		if(URL.hash === null || !URL.hash.includes('#access_token=')) {
			// If no access token specified, redirect to instagram auth page
			window.location = INSTAGRAM_AUTH_URL;
			return false;
		} else {
			this.accessToken = URL.hash.split('=')[1];
			this.nextPageUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + this.accessToken
								+ '&count=' + NUM_IMAGES_TO_REQUEST
								+ '&callback=?';
			return true;
		}
	}

	getProfileInfo() {
		// Include 'callback' query parameter to force JSONP
		const URL = 'https://api.instagram.com/v1/users/self/?access_token=' + this.accessToken
					+ '&callback=?';

		return new Promise( (resolve, reject) => {
			$.getJSON(URL, (result, status) => {
				if(status !== 'success') return reject(status);

				return resolve({
					name : result.data.full_name,
					profilePictureUrl : result.data.profile_picture
				});
			});
		});
	}

	canLoadMoreImages() {
		return this.nextPageUrl !== null;
	}

	getImages() {
		return new Promise( (resolve, reject) => {
			$.getJSON(this.nextPageUrl, (results, status) => {
				if(status !== 'success') return reject(status);

				// console.log('raw result from IG: ' + JSON.stringify(results, null, 4));

				let imageArray = results.data.map( data => {
					return {
						image : {
							standard : data.images.standard_resolution,
							thumbnail : data.images.thumbnail
						},
						caption : data.caption ? data.caption.text : ""
					}
				});

				let nextUrl = results.pagination.next_url || null;

				// Remove the calculated callback name to avoid Access-Control-Allow-Origin
				// errors.
				if(nextUrl !== null) {
					nextUrl = nextUrl.replace(/callback=(\w+)/, 'callback=?');
				}

				this.nextPageUrl = nextUrl;

				return resolve(imageArray);
			});
		});
	}
}
