import { ImageDTO } from './ImageDTO';
import { CoordinateDTO } from './CoordinateDTO';
export class ProjectDTO {
    projectId: string;
    projectName: string;
    projectDescription: string;
    field: string;
    projectStatus: string;
    projectStartDate: string;
    projectEndDate: string;
    projectCode: string;
    type: string;
    standard: string;
    images: ImageDTO[];
    coordinates: CoordinateDTO[];
  
    constructor(
      projectId: string,
      projectName: string,
      projectDescription: string,
      field: string,
      projectStatus: string,
      projectStartDate: string,
      projectEndDate: string,
      projectCode: string,
      type: string,
      standard: string,
      images: ImageDTO[],
      coordinates: CoordinateDTO[]
    ) {
      this.projectId = projectId;
      this.projectName = projectName;
      this.projectDescription = projectDescription;
      this.field = field;
      this.projectStatus = projectStatus;
      this.projectStartDate = projectStartDate;
      this.projectEndDate = projectEndDate;
      this.projectCode = projectCode;
      this.type = type;
      this.standard = standard;
      this.images = images;
      this.coordinates = coordinates;
    }
  }