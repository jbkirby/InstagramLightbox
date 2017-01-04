import InstagramImageSource from './InstagramImageSource';

//////// GLOBAL VARS ////////

// Interface to the underlying image API, in this case Instagram.
let imageSource = new InstagramImageSource();

// List of objects, each of which contains info on an image pulled from the global
// imageSource.
let imageInfo = [];

// Index of the object in imageInfo corresponding to the currently-displayed image.
let curImageIndex = -1;

//////// ENTRY POINT ////////

if(imageSource.authorize()) {
    // NOTE we're not currently doing anything with the profile info,
    // so I've commented out the request, but left it here for reference.
    Promise.all([
        // updateProfileInfo(),
        loadMoreImageInfo()
    ]).then(() => {
        // An initial batch of image descriptions has been loaded. Display our
        // first photo (if one exists), and set up the UI.
        showNextImage();
        attachListeners();
    });
} else {
    // TODO show something useful if authorization fails.
}

//////// HELPER FUNCTIONS ////////

function attachListeners() {
    $('a#next-link').click(e => {
        e.preventDefault();
        showNextImage();
    });

    $('a#prev-link').click(e => {
        e.preventDefault();
        showPreviousImage();
    });
}

// Request another page of image descriptions from our image source. We're not
// concerned with the number of images included per-page; we leave that up to
// the specifics of the image source implementation and the underlying provider.
function loadMoreImageInfo() {
    if(!imageSource.canLoadMoreImages()) return Promise.resolve();

    // Grab another batch of image data from the image source
    return imageSource.getImages()
    .then(results =>{
        imageInfo = imageInfo.concat(results);

        // Return just the retrieved info in case it's of use.
        return results;
    })
    .catch(err => {
        // TODO let the user know that something went wrong.
        // For now, just echo the error to the console with as much info as we have.
        console.log(
            err.meta ?
            JSON.stringify(err.meta, null, 4) :
            'There was an error retrieving information from the image source API.'
        );
    });
}

function showPreviousImage() {
    if(curImageIndex > 0) {
        curImageIndex--;

        showImage(curImageIndex);
        updateNavButtonVisibility();
    }
}

// Displays the photo described at index (curImageIndex + 1) in imageInfo,
// updates navigation buttons as needed, and pre-loads the next image (which might
// involve pulling another page of image descriptions first).
function showNextImage() {
    if(hasNextImage()) {
        curImageIndex++;
        showImage(curImageIndex);
    }

    updateNavButtonVisibility();
    tryPreloadNextImage();

    // If we've reached the final image in imageInfo, as the imageSource for more.
    // The "next" button will have been disabled by the above function call, so
    // we shouldn't have to worry about this method being called again before we're
    // ready.
    if(curImageIndex >= imageInfo.length - 1) {
        // Retrieve another batch of image info, if available.
        loadMoreImageInfo()
        .then(() => {
            // Restore the "next" button if more images are now available.
            updateNavButtonVisibility();
            tryPreloadNextImage();
        });
    }
}

// Display the image at the parameter index in imageInfo.
function showImage(index) {
    $('#focus-image').attr('src', imageInfo[index].image.standard.url);
    $('#image-description').text(imageInfo[index].caption);
}

// Hide or reveal nav buttons as appropriate.
function updateNavButtonVisibility() {
    $('#prev-link').toggleClass('hide', curImageIndex === 0);
    $('#next-link').toggleClass('hide', curImageIndex >= imageInfo.length - 1);
}

// Small performance optimization: if the currently displayed image is not the
// last in imageInfo, preload the next image.
function tryPreloadNextImage() {
    if(!hasNextImage()) return;

    let imageDescription = imageInfo[curImageIndex + 1];
    if(!imageDescription.image.standard.downloaded) {
        imageDescription.image.standard.downloaded = new Image();
        imageDescription.image.standard.downloaded.src = imageDescription.image.standard.url;
    }
}

function hasNextImage() {
    return curImageIndex < imageInfo.length - 1;
}

// NOTE Currently unused
function updateProfileInfo() {
    return imageSource.getProfileInfo()
    .then(result => {
        $('#user-name').text(result.name);
        $('#profile-picture').attr('src', result.profilePictureUrl);
    });
}
