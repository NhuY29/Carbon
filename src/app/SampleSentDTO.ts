
export interface SampleSentDTO {
    id:string
    projectId:string;
    sendDate:string;
    projectName?: string; // Sử dụng ? nếu thuộc tính này là tùy chọn
    projectDescription?: string; // Tương tự
    projectStatus?: string; // Tương tự
    projectStartDate?: Date; // Tương tự
    projectEndDate?: Date; // Tương tự
  }