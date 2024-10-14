import { Component, AfterViewInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  @Output() coordinatesChanged = new EventEmitter<any[]>();
  @Input() initialCoordinates: { lat: number, lng: number, order: number, radius?: number, type?: string }[] = [];
  private map: any;
  private markers: any[] = [];
  private drawnItems: any;
  private drawnPolygonPoints: { lat: number, lng: number, order: number, radius?: number, type?: string }[] = [];
  private drawnPolylinePoints: { lat: number, lng: number, order: number }[] = [];
  public coordinates: { lat: number, lng: number, order: number, radius?: number, type?: string }[] = [];
  private drawnPolygon: any;
  private routingControl: any;
  private currentLocation: L.LatLng | null = null;
  constructor() { }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit được gọi');
    if (typeof window !== 'undefined') {
      console.log('ngAfterViewInit được gọi load');
      this.loadLeaflet();
      console.log('ngAfterViewInit được gọi load xong');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialCoordinates'] && this.map) {
      this.renderInitialCoordinates();
    }
  }

  private async loadLeaflet() {
    try {
      const L = (await import('leaflet')).default;
      await import('leaflet-draw');
      await import('leaflet-routing-machine');
      this.drawnItems = new L.FeatureGroup();
      this.initMap(L);
    } catch (err) {
      console.error('Không tải được Leaflet hoặc Leaflet-draw', err);
    }
  }

  private initMap(L: any): void {
    this.map = L.map('map').setView([16.6769728, 105.4758068], 6.33);

    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.map);

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'marker-icon-2x.png',
      iconUrl: 'marker-icon.png',
      shadowUrl: 'marker-shadow.png',
    });

    this.map.addLayer(this.drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        marker: false,
        polyline: true,
        circle: false,
        rectangle: false,
        circlemarker: false
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true,
      }
    });
    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;

      if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        const latLngs = layer.getLatLngs();
        this.drawnPolylinePoints = latLngs.map((latLng: any, index: number) => ({
          lat: latLng.lat, lng: latLng.lng, order: index
        }));
        this.drawnItems.addLayer(layer);
        this.updateDrawnPolygon();
        this.coordinatesChanged.emit([...this.drawnPolygonPoints, ...this.drawnPolylinePoints]);
        console.log('Danh sách tọa độ (Polyline):', this.drawnPolylinePoints);

      } else if (layer instanceof L.Polygon) {
        const latLngs = layer.getLatLngs()[0];
        this.drawnPolygonPoints = latLngs.map((latLng: any, index: number) => ({
          lat: latLng.lat, lng: latLng.lng, order: index
        }));
        this.updateDrawnPolygon();
        this.coordinatesChanged.emit(this.drawnPolygonPoints);
        console.log('Danh sách tọa độ:', this.drawnPolygonPoints);
      }
    });

    this.map.on(L.Draw.Event.DELETED, (event: any) => {
      event.layers.eachLayer((layer: any) => {
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
          const latLngs = layer.getLatLngs();
          this.drawnPolylinePoints = this.drawnPolylinePoints.filter(point =>
            !latLngs.some((latLng: any) => latLng.lat === point.lat && latLng.lng === point.lng)
          );
          this.drawnItems.removeLayer(layer);
          this.updateDrawnPolygon();
          this.coordinatesChanged.emit([...this.drawnPolygonPoints, ...this.drawnPolylinePoints]);
          console.log('Danh sách tọa độ sau khi xóa (Polyline):', this.drawnPolylinePoints);
        } else if (layer instanceof L.Polygon) {
          const latLngs = layer.getLatLngs()[0];
          this.drawnPolygonPoints = this.drawnPolygonPoints.filter(point =>
            !latLngs.some((latLng: any) => latLng.lat === point.lat && latLng.lng === point.lng)
          );
          this.drawnItems.removeLayer(layer);
          this.updateDrawnPolygon();
          this.coordinatesChanged.emit([...this.drawnPolygonPoints, ...this.drawnPolylinePoints]);
          console.log('Đa giác đã bị xóa thông qua công cụ xóa.');
        }
      });
    });

    this.map.on(L.Draw.Event.EDITED, (event: any) => {
      event.layers.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon) {
          const latLngs = layer.getLatLngs()[0];
          this.drawnPolygonPoints = latLngs.map((latLng: any, index: number) => ({
            lat: latLng.lat, lng: latLng.lng, order: index
          }));
          this.updateDrawnPolygon();
          this.coordinatesChanged.emit(this.drawnPolygonPoints);
          console.log('Danh sách tọa độ sau khi chỉnh sửa (Polygon):', this.drawnPolygonPoints);
        }
      });
    });

    this.renderInitialCoordinates();
  }

  private renderInitialCoordinates(): void {
    if (this.initialCoordinates.length > 0) {
      const L = (window as any).L;
      const latLngs = this.initialCoordinates.map(coord => L.latLng(coord.lat, coord.lng));
      const polygon = L.polygon(latLngs, {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3
      }).addTo(this.map);
      this.drawnItems.addLayer(polygon);
      this.drawnPolygonPoints = this.initialCoordinates;
      this.coordinatesChanged.emit(this.initialCoordinates);
    }
  }

  private async updateDrawnPolygon(): Promise<void> {
    if (typeof window !== 'undefined') {
      const L = (await import('leaflet')).default;

      if (this.drawnPolygon) {
        this.map.removeLayer(this.drawnPolygon);
      }

      if (this.drawnPolygonPoints.length > 2) {
        const latLngs = this.drawnPolygonPoints.map(point => L.latLng(point.lat, point.lng));
        if (latLngs.length > 2) {
          latLngs.push(latLngs[0]);
        }

        this.drawnPolygon = L.polygon(latLngs, {
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 0.3
        }).addTo(this.map);

        this.drawnItems.addLayer(this.drawnPolygon);

        this.drawnPolygon.on('click', () => {

          this.drawnItems.removeLayer(this.drawnPolygon);
          this.drawnPolygonPoints = [];
          this.coordinatesChanged.emit([...this.drawnPolygonPoints, ...this.drawnPolylinePoints]);
          console.log('Đa giác đã bị xóa khi click.');
        });
      }
    }
  }

  public clearMap(): void {
    if (this.map) {
      this.drawnItems.clearLayers();
      if (this.drawnPolygon) {
        this.map.removeLayer(this.drawnPolygon);
        this.drawnPolygonPoints = [];
        this.drawnPolygon = null;
      }
      this.drawnPolylinePoints = [];
      this.coordinatesChanged.emit([...this.drawnPolygonPoints, ...this.drawnPolylinePoints]);
      console.log('Bản đồ đã được làm sạch.');
    }
  }

  public async calculateRoute(destination: { lat: number, lng: number }): Promise<void> {
    if (typeof window !== 'undefined') {
      const L = (await import('leaflet')).default;
      const routing = (await import('leaflet-routing-machine')).default;

      if (this.routingControl) {
        this.map.removeControl(this.routingControl);
      }

      this.routingControl = L.Routing.control({
        waypoints: [
          L.latLng(this.map.getCenter().lat, this.map.getCenter().lng),
          L.latLng(destination.lat, destination.lng)
        ],
        routeWhileDragging: true
      }).addTo(this.map);
    }
  }

  public async locateUser(): Promise<L.LatLng | null> {
    const L = (await import('leaflet')).default;
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
            const radius = position.coords.accuracy / 2;

            L.marker(latlng).addTo(this.map)
              .bindPopup(`You are within ${radius} meters from this point`).openPopup();

            L.circle(latlng, { radius: radius, color: 'blue', fillColor: '#30f', fillOpacity: 0.5 }).addTo(this.map);

            this.map.setView(latlng, 16);
            this.currentLocation = latlng;
            resolve(latlng);
          },
          (error) => {
            console.error('Error getting current location', error);
            alert('Error getting current location');
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }

}