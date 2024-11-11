export class CoordinateDTO {
  lat: number;
  lng: number;
  order: number;
  radius?: number;
  type?: string;
  address?: string;
  constructor(lat: number, lng: number, radius: number, order: number, type: string) {
    this.lat = lat;
    this.lng = lng;
    this.radius = radius;
    this.order = order;
    this.type = type;
    
  }
}