import $ from 'jquery';
import ImageSource from './ImageSource';

export default class InstagramImageSource extends ImageSource {
	constructor(accessToken) {
		super();
		this.accessToken = accessToken;
	}

	getProfileInfo() {
		// Include 'callback' query parameter to force JSONP
		const URL = 'https://api.instagram.com/v1/users/self/?access_token=' + this.accessToken + '&callback=?';

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

	getImages(url) {
		return new Promise( (resolve, reject) => {
			$.getJSON(url, (results, status) => {
				if(status !== 'success') return reject(status);

				console.log('raw result from IG: ' + JSON.stringify(results, null, 4));

				let imageArray = results.data.map( data => {
					return {
						image : {
							standard : data.images.standard_resolution,
							thumbnail : data.images.thumbnail
						},
						caption : data.caption ? data.caption.text : ""
					}
				});

				let nextPageUrl = results.pagination.next_url;
				if(nextPageUrl !== null) {
					nextPageUrl = nextPageUrl.replace(/callback=(\w+)/, 'callback=?');
				}

				return resolve({
					imageArray,
					nextPageUrl
				});
			});
		});
	}
}
