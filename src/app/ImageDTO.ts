export class ImageDTO {
    imageId: string;
    url: string;
  
    constructor(imageId: string, url: string) {
      this.imageId = imageId;
      this.url = url;
    }
  }