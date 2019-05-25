
module powerbi.extensibility.visual {
    interface DataPoints {
        category: string,
        // lastYear: number,
        thisYear: number
        thisYearGrowth: number
    }
    interface ViewModel {
        datapoints: DataPoints[]
    }
    "use strict";
    export class Visual implements IVisual {
        private viewModel: ViewModel;

        private pieChartContainer: d3.Selection<SVGElement>;
        private arc: any;
        private svg: d3.Selection<SVGElement>;
        private g: any;
        private pie: any;
        private pie2: any;
        private textLabel: d3.Selection<SVGElement>;






        constructor(options: VisualConstructorOptions) {
            let svg = this.svg = d3.select(options.element)
                .append('svg')
                .classed("pieChart", true);


            this.pieChartContainer = svg
                .append('g')
                .classed('pieChartContainer', true);
            this.textLabel = this.svg.append("g")
                .classed("textLabel", true);


        }

        public update(options: VisualUpdateOptions) {


            this.viewModel = this.getViewModel(options);
            console.log('this is the view model', this.viewModel)
            let width: number = options.viewport.width;
            let height: number = options.viewport.height;
            let radius = Math.min(width, height) / 2;
            this.svg.attr({
                width: width,
                height: height,
            });
            this.svg.selectAll('.rrrr').remove()

            let color = d3.scale.category20c();
            this.arc = d3.svg.arc()
                .innerRadius(0)
                .outerRadius(radius);

            let angle = []
            var labelr = radius + 30; // radius for label anchor


            this.pie = d3.layout.pie<DataPoints>()
            this.pie.value((d: DataPoints): number => Math.abs(d.thisYear))
                .startAngle(-90 * (Math.PI / 180))
                .endAngle(90 * (Math.PI / 180))
                .padAngle(.001)
                .sort(null)



            let tf2 = (d) => {
                angle.push(d);
                console.log('cent', this.arc.centroid(d));
                `translate(${this.arc.centroid(d)})`;
            }

            let tf = d => `translate(${this.arc.centroid(d)})`;
            let tf4 = (d) => {
                console.log('tf4', d)
                var c = arc2.centroid(d),
                    x = c[0],
                    y = c[1],
                    // pythagorean theorem for hypotenuse
                    h = Math.sqrt(x * x + y * y);
                return "translate(" + (x / h * labelr) + ',' +
                    (y / h * labelr) + ")";
            }


            let text = d => Math.abs(d.data.thisYear) + '%';
            let text2 = d => Math.abs(d.data.thisYearGrowth) + '%';
            this.pieChartContainer.attr('transform', 'translate(' + width / 2 + ',' + height + ')');
            console.log('refresh')


            this.g = this.pieChartContainer.selectAll('.arc')
                .data(this.pie(this.viewModel.datapoints))
                .enter()
                .append('g')
                .attr('class', 'arc')


            this.g.append('path')
                .attr('d', this.arc)
                .attr("fill", function (d, i) { return color(i); })
                .style("stroke", "black")
                .style("stroke-width", "0.8")
            this.g.append('text')
                .attr('transform', tf2)
                .attr('transform', tf)
                .attr("dy", 6)
                .style("text-anchor", "middle")
                .text(text)
         



            this.pie2 = d3.layout.pie<DataPoints>()
                .padAngle(.001)

            for (let i = 0; i < angle.length; i++) {
                

            


                if (this.viewModel.datapoints[i].thisYearGrowth < 0) {
                    console.log("yeahhh")
                    var arc2 = d3.svg.arc()
                        .innerRadius(radius + 10)
                        .outerRadius(radius + 50)
                        .startAngle(angle[i].endAngle - 0.02)
                        .endAngle(angle[i].endAngle - (Math.abs(this.viewModel.datapoints[i].thisYearGrowth / 100)) * (angle[i].endAngle - angle[i].startAngle))
                    this.g.append("path")
                        .attr("id", "yyy")
                        .attr("d", arc2)
                        .attr("fill", 'red')
                    this.g.selectAll('.arcs')
                        .data(this.pie(this.viewModel.datapoints))
                        .enter()
                        this.g.append('text')
                        .attr('transform', tf4)
                        .style("text-anchor", "end")
                        .text(Math.abs(this.viewModel.datapoints[i].thisYearGrowth))
        


                }
                else {

                    console.log('diffrence in for', angle[i].endAngle - angle[i].startAngle)
                    var arc2 = d3.svg.arc()
                        .innerRadius(radius + 10)
                        .outerRadius(radius + 50)
                        .startAngle(angle[i].startAngle)
                        .endAngle((angle[i].startAngle + (Math.abs(this.viewModel.datapoints[i].thisYearGrowth / 100)) * (angle[i].endAngle - angle[i].startAngle)))
                    this.g.append("path")
                        .attr("d", arc2)
                        .attr("fill", 'green')
                    this.g.selectAll('.arcs')
                        .data(this.pie(this.viewModel.datapoints))
                        .enter()
                        this.g.append('text')
                        .attr('transform', tf4)
                        .style("text-anchor", "start")
                        .text(Math.abs(this.viewModel.datapoints[i].thisYearGrowth))
        


                }
               

            }
            var x = d3.scale.linear().domain([-1, 20]).range([0, 400]);

            var c = this.svg.selectAll("circle")
                .data(d3.range(this.viewModel.datapoints.length))
                .enter()
                .append("circle")
                .attr("r", 9)
                .attr("cx", 20)
                .attr("cy", d3.scale.linear().domain([-1, 20]).range([0, 400]))
                .attr("fill", function (d, i) { return color(<any>i); })


            for (let i = 0; i < this.viewModel.datapoints.length; i++) {
                var te = this.svg.append("text")
                te.data(this.viewModel.datapoints)
                    .classed('rrrr', true)
                te.attr("x", 40)
                te.attr("y", 18 + i * 20)
                    .attr("dy", ".35em")
                te.style("text-anchor", "start")
                    .text(this.viewModel.datapoints[i].category)

            }




















        }

        private getViewModel(options: VisualUpdateOptions): ViewModel {
            let dv = options.dataViews;
            var dataArray = [];
            let viewModel = {
                datapoints: [],
            }
            let view = dv[0].categorical;
            let categories = view.categories;
            let value = view.values
            for (let i = 0; i < categories[0].values.length; i++) {
                dataArray.push({
                    category: <string>categories[0].values[i],
                    thisYear: <number>value[0].values[i],
                    lastYear: <number>value[1].values[i]
                })
            }
            var sum = d3.sum(<any>value[0].values)
            console.log(sum)
            for (let i = 0; i < dataArray.length; i++) {
                viewModel.datapoints.push({
                    category: dataArray[i].category,
                    thisYearGrowth: ((dataArray[i].thisYear - dataArray[i].lastYear) / dataArray[i].lastYear * 100).toFixed(1),
                    thisYear: ((dataArray[i].thisYear) / sum * 100).toFixed(1)
                })




            }
            console.log(viewModel.datapoints)
            return viewModel
        }
    }
}