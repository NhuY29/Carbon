import { Component, AfterViewInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { CoordinateDTO } from '../CoordinateDTO';
import '@fortawesome/fontawesome-free/css/all.css';
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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
  private tileLayers: any = {};
  private currentTileLayer: any;
  public destination: { lat: number, lng: number } | null = null;
  public showDirectionsForm: boolean = false;
  public directionsForm: FormGroup;
  projectId: string | null = null;
  constructor(private api: ApiService, private route: ActivatedRoute, private fb: FormBuilder) {
    this.directionsForm = this.fb.group({
      destination: ['', Validators.required],
      transportMode: ['driving', Validators.required]
    });
  }
 

  ngOnInit(): void {
    
    this.route.paramMap.subscribe(params => {
      const isCustomUrl = window.location.href.includes('/ggmap/');
      if (isCustomUrl) {
        this.projectId = params.get('projectId');
      } else {
        this.projectId = params.get('id');
      }
  
      console.log('Project ID:', this.projectId);
      
      if (this.projectId) {
        this.api.getCoordinatesByProjectId(this.projectId).subscribe(
          (data: CoordinateDTO[]) => {
            this.coordinates = data;
            console.log('Coordinates:', this.coordinates);
  
            const firstCoordinate = this.getFirstCoordinate();
            if (firstCoordinate) {
              console.log('Tọa độ đầu tiên:', firstCoordinate);
            } else {
              console.log('Không có tọa độ nào');
            }
          },
          error => {
            console.error('Error fetching coordinates:', error);
          }
        );
      }
    });
    
  }

  

  public getFirstCoordinate(): CoordinateDTO | null {
    if (this.coordinates.length > 0) {
      return this.coordinates[0];
    }
    return null;
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.loadLeaflet();
    }
  }
  public async showCurrentLocation(): Promise<void> {
    try {
      const latlng = await this.locateUser();
      if (latlng) {
        console.log(`Vị trí hiện tại của bạn là: ${latlng.lat}, ${latlng.lng}`);
      }
    } catch (error) {
      console.error('Không thể xác định vị trí hiện tại:', error);
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

    this.tileLayers = {
      'Bản đồ đường phố <img src="https://maps.gstatic.com/tactile/layerswitcher/ic_transit_colors2-2x.png" width="50" height="50">': L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
      'Bản đồ vệ tinh <img src="https://maps.gstatic.com/tactile/layerswitcher/ic_satellite-1x.png">': L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
      'Bản đồ kết hợp <img src="https://maps.gstatic.com/tactile/layerswitcher/ic_bicycling_colors2-2x.png" width="50" height="50">': L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
      'Bản đồ địa hình <img src="https://maps.gstatic.com/tactile/layerswitcher/ic_terrain-1x.png">': L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      })
    };


    this.currentTileLayer = this.tileLayers['Bản đồ đường phố <img src="https://maps.gstatic.com/tactile/layerswitcher/ic_transit_colors2-2x.png" width="50" height="50">'];
    this.currentTileLayer.addTo(this.map);

    L.control.layers(this.tileLayers).addTo(this.map);

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
    const customControlDirections = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: (map: any) => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.innerHTML = '<i class="fa-solid fa-diamond-turn-right" style="font-size: 20px;"></i>';
        container.title = "Chỉ đường";

        container.style.backgroundColor = 'white';
        container.style.width = '50px';
        container.style.height = '50px';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.borderRadius = '5px';

        container.onclick = async () => {
          try {
            await this.navigateToFirstCoordinate();
          } catch (error) {
            console.error('Lỗi khi chỉ đường:', error);
          }
        };

        return container;
      }
    });
    this.map.addControl(new customControlDirections());
    const customControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: (map: any) => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        container.innerHTML = '<i class="fa-solid fa-crosshairs" style="font-size: 20px;"></i>';
        container.title = "Hiển thị vị trí của bạn";

        container.style.backgroundColor = 'white';
        container.style.width = '50px';
        container.style.height = '50px';
        container.style.lineHeight = '50px';
        container.style.textAlign = 'center';
        container.style.cursor = 'pointer';
        container.style.transition = 'background-color 0.3s';
        container.style.borderRadius = '5px';

        container.onmouseenter = () => {
          container.style.backgroundColor = '#f0f0f0';
        };
        container.onmouseleave = () => {
          container.style.backgroundColor = 'white';
        };

        container.onclick = () => {
          this.locateUser()
            .then(latlng => {
              console.log("Current location:", latlng);
            })
            .catch(error => {
              console.error("Error locating user:", error);
            });
        };

        return container;
      }
    });

    this.map.addControl(new customControl());

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
  private async renderInitialCoordinates(): Promise<void> {
    try {
      const L = (await import('leaflet')).default;
      await import('leaflet-draw');
      await import('leaflet-routing-machine');
      if (!this.map) {
        console.error('Map is not initialized');
        return;
      }

      if (!this.drawnItems) {
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);
      }

      if (!this.coordinates || this.coordinates.length === 0) {
        console.warn('No coordinates data found');
        return;
      }

      const sortedCoordinates = this.coordinates.sort((a, b) => a.order - b.order);
      if (sortedCoordinates.length === 0) {
        console.warn('No valid coordinates after sorting');
        return;
      }
      const latLngs: L.LatLngExpression[] = sortedCoordinates
        .map(coordinate => {
          if (coordinate.lat && coordinate.lng) {
            return [coordinate.lat, coordinate.lng] as L.LatLngTuple;
          }
          return undefined;
        })
        .filter((coord): coord is L.LatLngTuple => coord !== undefined);

      if (this.drawnItems.getLayers().length > 0) {
        this.drawnItems.clearLayers();
        console.log('Cleared existing layers');
      }

      if (latLngs.length > 0) {
        const polygon = L.polygon(latLngs, { color: 'blue' }).addTo(this.map);
        this.drawnItems.addLayer(polygon);

        const bounds = L.latLngBounds(latLngs);
        this.map.fitBounds(bounds);
      }
    } catch (err) {
      console.error('Failed to load Leaflet or Leaflet-draw', err);
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
  public async navigateToFirstCoordinate(): Promise<void> {
    try {

      const latlng = await this.locateUser();
      if (latlng) {
        console.log(`Vị trí hiện tại của bạn là: ${latlng.lat}, ${latlng.lng}`);


        const firstCoordinate = this.getFirstCoordinate();
        if (firstCoordinate) {

          await this.calculateRoute({ lat: firstCoordinate.lat, lng: firstCoordinate.lng });
        } else {
          console.log('Không có tọa độ nào để chỉ đường.');
        }
      }
    } catch (error) {
      console.error('Không thể xác định vị trí hiện tại hoặc chỉ đường:', error);
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

  public async changeMapType(event: any): Promise<void> {
    const L = (await import('leaflet')).default;
    const mapType = event.target.value;


    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }


    switch (mapType) {
      case 'roadmap':
        this.currentTileLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        });
        break;
      case 'satellite':
        this.currentTileLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        });
        break;
      case 'hybrid':
        this.currentTileLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        });
        break;
      case 'terrain':
        this.currentTileLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        });
        break;
    }

    if (this.currentTileLayer) {
      this.currentTileLayer.addTo(this.map);
    }
  }

  public onSubmitDirections(): void {
    const destination = this.directionsForm.get('destination')?.value;
    const transportMode = this.directionsForm.get('transportMode')?.value;

    if (destination && transportMode) {

      console.log(`Tìm đường đến ${destination} bằng ${transportMode}`);
    }
  }
}