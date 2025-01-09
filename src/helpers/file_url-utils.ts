/**
 * isLocalHost:
 *
 * @returns {Boolean}
 *
 */

export const isLocalHost = (): boolean => {
  return window.location.port === ""
  ? ["http://localhost", "http://127.0.0.1"].includes(
    window.location.origin.replace(/\:[\d$]{4,5}/, "")
  )
  : Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  )
};

/*!
 * @EXAMPLE:
 *
 * const currentlyLocalHost = isLocalHost();
 *
 * console.log(currentlyLocalHost) // false
 *
 */

/**
 * isRemotsHost:
 *
 * @returns {Boolean}
 *
 */
export const isRemoteHost = (): boolean => {
  return window.location.origin.includes(process.env.REACT_APP_REMOTE_HOST);
};

/*!
 * @EXAMPLE:
 *
 * const currentlyRemoteHost = isRemoteHost();
 *
 * console.log(currentlyRemoteHost) // true
 *
 */

/**
 * bloToataURL: 
 * 
 * @param {Blob} blob
 * 
 * @returns {Promise<String>}
 *
 */
export const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((fulfill: Function, reject: Function) => {
    let reader: FileReader = new FileReader()
    reader.onerror = (ev: ProgressEvent<FileReader>) =>
      reject(ev.target?.error)
	  
    reader.onload = () => fulfill(reader.result)
    reader.readAsDataURL(blob)
  })
};

/*!
 * @EXAMPLE:
 *
 * blobToDataURL(new Blob(['hello!'], { type: "text/plain" })).then(
 *   (dataURL) => {
 *
 * });
 *
 */

/**
 * dataURLtoObjectURL: converts a data URI to an object URL
 * 
 * 
 * @param {String} dataURL
 * 
 * @returns {String}
 * 
 * @see https://en.wikipedia.org/wiki/Data_URI_scheme/
 */
export const dataURLtoObjectURL = (dataURL?: string): string => {
  const [ mimeType, base64String ] = (dataURL || ",").split(",");
  const [, contentTypeDataPrefix ] = mimeType.split(":") || [, ";"];

  const [ contentType ] = contentTypeDataPrefix
    ? contentTypeDataPrefix.split(";")
    : ["application/octet-stream"];

  return URL.createObjectURL(
    base64StringToBlob(base64String, contentType)
  );
};

 /*!
  * @EXAMPLE:
  *
  *
  * const objectURL = dataURLtoObjectURL(
  *   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
  * )
  *
  * console.log(objectURL) // ""
  *
  */
  
  /**
   * dataURLtoObjectBlob: converts a data URI to a blob
   * 
   * 
   * @param {String} dataURL
   * 
   * @returns {Blob}
   * 
   * @see https://en.wikipedia.org/wiki/Data_URI_scheme/
   * @see https://en.wikipedia.org/wiki/Binary_large_object/
   */
  export const dataURLtoObjectBlob = (dataURL?: string): Blob => {
    const [ mimeType, base64String ] = (dataURL || ",").split(",");
    const [, contentTypeDataPrefix ] = mimeType.split(":") || [, ";"];
  
    const [ contentType ] = contentTypeDataPrefix
      ? contentTypeDataPrefix.split(";")
      : ["application/octet-stream"];
  
    return base64StringToBlob(base64String, contentType);
  };
  
  /*!
   * @EXAMPLE:
   * 
   * const fileBlob = dataURItoObjectBlob(
   *  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
   * );
   * console.log(fileBlob); // Blob {size: 68, type: 'image/png'}
   */
  
  /**
   * blobToFile:
   *
   * @param {Blob | Undefined} theBlob
   * @param {String | Null | Undefined} fileName
   * @param {Boolean} useCast
   * 
   * @returns {File}
   *
   */
  export const blobToFile = (theBlob?: Blob, fileName?: string | null, useCast = false): File => {
    const todaysDate = new Date();
    const defaultFileName = `${todaysDate.getTime()}_${Math.random() * 1}`;
  
    const defaultFileExtension = `.${fileExtension(theBlob?.type)}`;
    const fullFileName = defaultFileName + defaultFileExtension;
  
    if (!(theBlob instanceof window.Blob)) {
      return new File([""], fullFileName);
    }
  
    const blob = <Blob & { lastModifiedDate: Date, name: string }>theBlob;
  
    blob.lastModifiedDate = new Date();
    blob.name = fileName || fullFileName;
  
    return useCast ? <File>theBlob : new File([theBlob], fileName || fullFileName);
  };

  /*!
   * @EXAMPLE:
   *
   *
   * const file = blobToFile(new Blob(['hello!'], { type: 'text/plain' }), "text.txt");
   *
   * console.log(file) // File: { name: 'text.txt', size: 48 }
   *
   */
  
  /**
   * base64StringToBlob:
   *
   * @param {String} base64Data
   * @param {String} contentType
   * @param {Number} sliceSize
   * 
   * @returns {Blob}
   *
   */
  export const base64StringToBlob = (base64Data: string, contentType?: string | null, sliceSize = 512) => {
    const $contentType = contentType || "";
  
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
  
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
  
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: $contentType });
 };

/* @EXAMPLE: const urlString = blobToDataURL(new Blob(['hello world'], { type: 'text/plain' })) */

/**
 * getJpegBlob:
 *
 * @param {HTMLCanvasElement | null} canvas
 * 
 * @returns {Promise<Blob | null>}
 *
 */
export function getJpegBlob(canvas: HTMLCanvasElement | null): Promise<Blob | null> {
  /* @CHECK: https://stackoverflow.com/a/46182044/5221762 */

  /* @NOTE: May require the `toBlob()` polyfill */
  if (!HTMLCanvasElement.prototype.toBlob) {
    window.Object!.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      value: function (callback, type, quality) {
        const canvas = this;
      	window.setTimeout(function() {
	  var binStr = atob( canvas.toDataURL(type, quality).split(',')[1] ),
	    len = binStr.length,
	    arr = new Uint8Array(len);

	  for (let index = 0; index < len; index++ ) {
	    arr[index] = binStr.charCodeAt(index);
	  }

	  callback( new Blob( [arr], {type: type || 'image/png'} ) );
	}, 0);
      }
    });
  }
  
  return new Promise((resolve, reject) => {
    try {
      if (canvas) {
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95);
      }
    } catch (e) {
      reject(e);
    }
  })
};

/*!
 * @EXAMPLE:
 * 
 * const blob = await getJpegBlob(window.document.getElementsByTagName('canvas')[0]);
 *
 * console.log(blob) // Blob: {}
 *
 */

/**
 * getJpegBytes:
 *
 * @param {HTMLCanvasElement | null} canvas
 * 
 * @returns {Promise<string | ArrayBuffer | null>}
 *
 */
export function getJpegBytes(canvas: HTMLCanvasElement | null): Promise<string | ArrayBuffer | null> {
  return getJpegBlob(canvas).then((blob) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
	
      fileReader.addEventListener('loadend', () => {
	if (this.error) {
	  reject(this.error)
	  return
	}

	resolve(this.result)
      })
	
      if (blob) {
	fileReader.readAsArrayBuffer(blob);
      }
    })
  })
};

/*!
 * @EXAMPLE:
 * 
 * const bytes = await getJpegBytes(window.document.getElementsByTagName('canvas')[0]);
 *
 * console.log(bytes); // 
 *
 */

/**
 * isBase64String:
 *
 * @param {String} base64String
 * 
 * @returns {Boolean}
 *
 */
export const isBase64String = (base64String: string): boolean => {
  let base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
   return typeof base64String !== 'string'
     ? false
     : (base64String.length % 4 === 0) && base64Regex.test(base64String)
};

/* @EXAMPLE: isBase64String("") */

/**
 * getEmbedUrl:
 *
 * @param {String | Null} url
 * @param {Boolean} autoPlay
 *
 *
 * @returns {String}
 *
 */
export const getEmbedUrl = (url: string | null, autoPlay = false): string => {
  if (!url || typeof url !== "string") return '';
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '').replace('m.', '');
    let videoId = '';
    if (domain === 'youtube.com' || domain === 'youtu.be') {
      if (parsedUrl.pathname.includes('/embed/')) {
        return `${url}${autoPlay ? '?&autoplay=1&mute=1' : ''}`;
      }
      if (parsedUrl.pathname.includes('/watch')) {
        videoId = parsedUrl.searchParams.get('v') || '';
        return `https://www.youtube.com/embed/${videoId}${autoPlay ? '?&autoplay=1&mute=1' : ''}`;
      }
      if (domain === 'youtu.be') {
        videoId = parsedUrl.pathname.replace('/', '');
        return `https://www.youtube.com/embed/${videoId}${autoPlay ? '?&autoplay=1&mute=1' : ''}`;
      }
    } else if (domain === 'vimeo.com' || domain === 'player.vimeo.com') {
      if (parsedUrl.pathname.includes('/video/')) {
        return `${url}${autoPlay ? '?&autoplay=1&muted=1' : ''}`;
      }
      videoId = parsedUrl.pathname.replace('/', '');
      return `https://player.vimeo.com/video/${videoId}${autoPlay ? '?&autoplay=1&muted=1' : ''}`;
    }
  } catch (error) {
    console.error('Invalid URL:', error);
    throw error;
  }
  return '';
};

/* @EXAMPLE: getEmbedUrl("https://youtube.com/watch?v=9JLpWR_yHZQ", true); */

/**
 * fileExtension:
 * 
 * @param {String} urlOrFileType
 * 
 * @returns {String}
 */
 export const fileExtension = (urlOrFileType?: string | null): string => {
   let extension = "blob";
   if (
     urlOrFileType === "image/png" ||
     urlOrFileType === "image/jpeg" ||
     urlOrFileType === "image/jpg" ||
     urlOrFileType === "image/svg+xml" ||
     urlOrFileType === "application/pdf" ||
     urlOrFileType === "text/plain" ||
     urlOrFileType === "application/json" ||
     urlOrFileType === "text/javascript" ||
     urlOrFileType === "text/css" ||
     urlOrFileType === "text/csv" ||
     urlOrFileType === "text/x-csv" ||
     urlOrFileType === "application/vnd.ms-excel" ||
     urlOrFileType === "application/csv" ||
     urlOrFileType === "application/x-csv" ||
     urlOrFileType === "text/comma-separated-values" ||
     urlOrFileType === "text/x-comma-separated-values" ||
     urlOrFileType === "text/tab-separated-values" ||
     urlOrFileType === "application/octet-stream"
   ) {
     [ extension ] = (urlOrFileType || "/").split("/").reverse();
     if (extension === "octet-stream") {
	extension = "blob";
     }
  
     if ([
	"x-csv",
	"vnd.ms-excel",
	"tab-separated-values",
	"comma-separated-values",
	"x-comma-separated-values"].includes(extension)) {
	  extension = "csv";
     }
   } else if (typeof urlOrFileType === "string") {
     const [ urlBaseName ] = urlOrFileType.split(/[#?]/);
     [ extension ] = urlBaseName.split(".").reverse();
   }
	
   return extension === "javascript" ? "js" : extension;
};

/* @EXAMPLE: fileExtension("image/png") */

