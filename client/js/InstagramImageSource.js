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

	getImages() {
		// Include 'callback' query parameter to force JSONP
		const URL = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + this.accessToken + '&count=1&callback=?';

		return new Promise( (resolve, reject) => {
			$.getJSON(URL, (result, status) => {
				if(status !== 'success') return reject(status);

				return resolve({
					result
				});
			});
		});
	}
}
