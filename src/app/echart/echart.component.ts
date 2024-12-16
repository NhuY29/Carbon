import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { ApiService } from '../../api.service';
import * as echarts from 'echarts';
interface CommuneDistrictDTO {
  commune: string;
  district: string;
  projectCount: number;
}
interface Echart {
  name: string;
  projectCount: number;
  additionalQuantity: number;
  emissionReduction: number;
}

@Component({
  selector: 'app-echart',
  standalone: true,
  imports: [],
  templateUrl: './echart.component.html',
  styleUrls: ['./echart.component.scss']
})
export class EchartComponent implements AfterViewInit {
  private selectedChartType: string = 'projectType';

  constructor(private http: HttpClient, private api: ApiService) { }

  ngAfterViewInit(): void {
    this.initBarChart();  
    this.initPieChart();  
  }
  initBarChart(): void {
    this.api.getCommuneDistrictProjectCounts().subscribe({
      next: (data: CommuneDistrictDTO[]) => {
        const chartDom = document.getElementById('barChart');
        const myChart = echarts.init(chartDom!);
        const districts = [...new Set(data.map(item => item.district))];
        const communes = [...new Set(data.map(item => item.commune))];
  
        const seriesData = communes.map((commune) => {
          return {
            name: commune,  
            type: 'bar',
            stack: 'project',
            data: districts.map((district) => {
              const project = data.find(item => item.commune === commune && item.district === district);
              return project ? project.projectCount : 0;
            }),
          };
        });
  
        const option = {
          title: {
            text: 'Biểu đồ phân bố số lượng dự án theo xã/phường và quận/huyện',
            left: 'center',
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function (params: any) {
              const commune = params[0].name;  
              let tooltipContent = `<b>${commune}</b><br/>`;
              params.forEach((item: any) => {
                if (item.value > 0) {
                  tooltipContent += `${item.marker} ${item.seriesName}: ${item.value} projects<br/>`;
                }
              });
              return tooltipContent;
            },
          },
          legend: {
            data: communes,  
            top: '10%',
          },
          xAxis: {
            type: 'category',
            data: districts,  
            axisLabel: {
              rotate: 30,
            },
          },
          yAxis: {
            type: 'value',
          },
          series: seriesData,  
        };
  
        myChart.setOption(option);
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu từ API:', err);
      },
    });
  }
  
  initPieChart(): void {
    const chartDom = document.getElementById('pieChart');
    const myChart = echarts.init(chartDom!);
    myChart.clear();
  
    if (this.selectedChartType === 'projectType') {
      this.api.getProjectTypeData().subscribe((data: Echart[]) => {
        const nameRequests = data.map(item => this.api.getCategoryById2(item.name));
        forkJoin(nameRequests).subscribe((names: any[]) => {
          const chartData = data.map((item, index) => ({
            value: item.projectCount,
            name: names[index].name,  
            projectCount: item.projectCount,
            additionalQuantity: item.additionalQuantity,
            emissionReduction: item.emissionReduction, 
          }));
  
          const option = {
            title: {
              text: 'Biểu đồ phân bố  số lượng tín chỉ - dự án theo loại hình',
              left: 'center',
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                return `
                  <b>${params.name}</b><br/>
                  Số lượng dự án: ${params.data.projectCount}<br/>
                  Số lượng tín chỉ phát thải: ${params.data.additionalQuantity} tấn CO2<br/>
                  Số lượng tín chỉ giảm phát thải: ${params.data.emissionReduction} tấn CO2<br/> 
                `;
              },
            },
            series: [
              {
                name: 'Loại hình dự án',
                type: 'pie',
                radius: '50%',
                data: chartData,
                emphasis: {
                  itemStyle: {
                    borderWidth: 10,
                    borderColor: '#fff',
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                  },
                },
              },
            ],
          };
  
          myChart.setOption(option);
        });
      });
    } else if (this.selectedChartType === 'standardType') {
      this.api.getProjectStandardData().subscribe((data: Echart[]) => {
        const nameRequests = data.map(item => this.api.getCategoryById2(item.name));
        forkJoin(nameRequests).subscribe((names: any[]) => {
          const chartData = data.map((item, index) => ({
            value: item.projectCount,
            name: names[index].name,  
            projectCount: item.projectCount,
            additionalQuantity: item.additionalQuantity,
            emissionReduction: item.emissionReduction, 
          }));
  
          const option = {
            title: {
              text: 'Biểu đồ phân bố  số lượng tín chỉ - dự án theo tiêu chuẩn',
              left: 'center',
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                return `
                  <b>${params.name}</b><br/>
                  Số lượng dự án: ${params.data.projectCount}<br/>
                  Số lượng tín chỉ phát thải: ${params.data.additionalQuantity} tấn CO2<br/>
                  Số lượng tín chỉ giảm phát thải: ${params.data.emissionReduction} tấn CO2<br/>
                `;
              },
            },
            series: [
              {
                name: 'Tiêu chuẩn dự án',
                type: 'pie',
                radius: '50%',
                data: chartData,
                emphasis: {
                  itemStyle: {
                    borderWidth: 10,
                    borderColor: '#fff',
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                  },
                },
              },
            ],
          };
  
          myChart.setOption(option);
        });
      });
    }
  }  

  onChartTypeChange(event: any): void {
    this.selectedChartType = event.target.value;
    this.initPieChart();
  }
}
