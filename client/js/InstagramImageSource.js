import url from 'url';

const INSTAGRAM_CLIENT_ID = '54cf06a9c7fa4584b9008927c8721b41';

// NOTE Try setting to e.g. 5 to demonstrate multiple API accesses.
const NUM_IMAGES_TO_REQUEST = 20;

/**
 * Encapsulates the Instagram API. Methods are generalized to allow straightforward
 * implementation of compatible classes for other image APIs.
 */
export default class InstagramImageSource {
    constructor() {
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

        return new Promise((resolve, reject) => {
            $.getJSON(URL, (result, status) => {
                if(status !== 'success') return reject(result);

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
                if(status !== 'success' || (results.meta && results.meta !== 200)) {
                    return reject(results);
                }

                let imageArray = results.data.map(data => {
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
