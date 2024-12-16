
import { Component, OnInit, AfterViewInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { CoordinateDTOAll } from './CoordinateDTOAll ';
import '@fortawesome/fontawesome-free/css/all.css';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  private map: any;
  private drawnItems: any;
  public coordinates: { [key: string]: CoordinateDTOAll[] } = {};
  private tileLayers: any = {};
  private currentTileLayer: any;
  public destination: { lat: number, lng: number } | null = null;
  public showDirectionsForm: boolean = false;
  public directionsForm: FormGroup;
  projectId: string | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.directionsForm = this.fb.group({
      destination: ['', Validators.required],
      transportMode: ['driving', Validators.required]
    });
  }

  ngOnInit(): void {
    this.api.getAllCoordinates().subscribe(
      (data: CoordinateDTOAll[]) => {
        data.forEach((coordinate) => {
          if (!this.coordinates[coordinate.projectId]) {
            this.coordinates[coordinate.projectId] = [];
          }
          this.coordinates[coordinate.projectId].push(coordinate);
        });
        console.log('Coordinates grouped by projectId:', this.coordinates);

        this.drawCoordinatesOnMap();
      },
      (error) => {
        console.error('Error fetching coordinates:', error);
      }
    );
  }

  private async drawCoordinatesOnMap(): Promise<void> {
    try {
      const L = (await import('leaflet')).default;
      await import('leaflet-draw');
      await import('leaflet-routing-machine');
    
      if (!this.map) {
        console.error('Map is not initialized');
        return;
      }
    
      this.drawnItems = new L.FeatureGroup();
      this.map.addLayer(this.drawnItems);
    
      for (const projectId in this.coordinates) {
        if (this.coordinates.hasOwnProperty(projectId)) {
          const sortedCoordinates = this.coordinates[projectId].sort((a, b) => a.order - b.order);
          const latLngs: L.LatLngExpression[] = sortedCoordinates
            .map(coordinate => {
              if (coordinate.lat && coordinate.lng) {
                return [coordinate.lat, coordinate.lng] as L.LatLngTuple;
              }
              return undefined;
            })
            .filter((coord): coord is L.LatLngTuple => coord !== undefined);
    
          if (latLngs.length > 0) {
            this.api.getProjectById(projectId).subscribe(
              (project) => {
                let polygonColor = 'green';
                if (project.quantityNoburn === null) {
                  polygonColor = 'red';  
                } else if (project.quantityNoburn > 100) {
                  polygonColor = 'yellow';  
                }
    
                const polygon = L.polygon(latLngs, { color: polygonColor }).addTo(this.map);
                this.drawnItems.addLayer(polygon);
    
                const center = L.latLngBounds(latLngs).getCenter();
    
                polygon.on('click', () => {
                  const typeName$ = this.api.getCategoryById2(project.type);
                  const standardName$ = this.api.getCategoryById2(project.standard);
    
                  forkJoin([typeName$, standardName$]).subscribe(
                    ([typeCategory, standardCategory]) => {
                      const popupContent = `
                        <div>
                          <h4>Thông tin dự án</h4>
                          <p><strong>Tên dự án:</strong> ${project.projectName}</p>
                          <p><strong>Mô tả:</strong> ${project.projectDescription}</p>
                          <p><strong>Lĩnh vực:</strong> ${project.field}</p>
                          <p><strong>Loại hình:</strong> ${typeCategory.name}</p>
                          <p><strong>Tiêu chuẩn:</strong> ${standardCategory.name}</p>
                          <p><strong>Sở hữu:</strong> ${project.user.username}</p>
                          <p><strong>Số tín chỉ phát thải:</strong> ${project.quantityBurn || 'N/A'}</p>
                          <p><strong>Số tín chỉ giảm phát thải:</strong> ${project.quantityNoburn || 'N/A'}</p>
                        </div>
                      `;
    
                      const popup = L.popup()
                        .setLatLng(center) 
                        .setContent(popupContent)
                        .openOn(this.map);
                    },
                    (error) => {
                      console.error('Lỗi khi gọi API loại hình/tiêu chuẩn:', error);
                      const popup = L.popup()
                        .setLatLng(center)
                        .setContent('<p>Không thể tải loại hình hoặc tiêu chuẩn.</p>')
                        .openOn(this.map);
                    }
                  );
                });
              },
              (error) => {
                console.error('Lỗi khi gọi API dự án:', error);
                const popup = L.popup()
                  .setLatLng(latLngs[0]) 
                  .setContent('<p>Không thể tải thông tin dự án.</p>')
                  .openOn(this.map);
              }
            );
          }
        }
      }
    } catch (err) {
      console.error('Failed to load Leaflet or Leaflet-draw', err);
    }
  }
  
  
  
  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.loadLeaflet();
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
      console.error('Failed to load Leaflet or Leaflet-draw', err);
    }
  }

  private initMap(L: any): void {
    this.map = L.map('map').setView([16.6769728, 105.4758068], 6.33);

    this.tileLayers = {
      'Bản đồ đường phố': L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
      'Bản đồ vệ tinh': L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      })
    };

    this.currentTileLayer = this.tileLayers['Bản đồ đường phố'];
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
  }
}
