export interface MeasurementDetails {
    wasteSource: string;
    gas: string;
    data: number;
  }
  
  export interface MeasurementDataRequest {
    measurer: string;
    measurementDate: string; 
    farmingProcess: string;
    phonelandowner: string;
    namelandowner: string;
    projectId: string;
    measurements: MeasurementDetails[];
  }
  