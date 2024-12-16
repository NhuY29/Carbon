import { ImageDTO } from './ImageDTO';
import { CoordinateDTO } from './CoordinateDTO';
import { UserDTO } from '../user.interface';

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
  user: UserDTO;
  quantityBurn: number;
  quantityNoburn: number;
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
    coordinates: CoordinateDTO[],
    user: UserDTO,
    quantityBurn: number,
    quantityNoburn: number
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
    this.user = user;
    this.quantityBurn = quantityBurn;
    this.quantityNoburn = quantityNoburn;
  }
}
