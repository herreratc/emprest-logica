import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export type TotaisMensaisProps = {
  categories: string[];
  data: number[];
  height?: number;
};

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const createColor = (opacity: number) => `rgba(126, 87, 194, ${opacity})`;

const buildColors = (length: number, activeIndex: number | null) =>
  Array.from({ length }, (_, idx) => {
    if (activeIndex === null) return createColor(0.9);
    return idx === activeIndex ? createColor(1) : createColor(0.35);
  });

export function TotaisMensais({ categories, data, height = 380 }: TotaisMensaisProps) {
  const baseColors = useMemo(() => buildColors(categories.length, null), [categories.length]);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        height,
        toolbar: { show: false },
        animations: { easing: 'easeinout', speed: 300 },
        events: {
          dataPointMouseEnter: (_event, chartContext, config) => {
            const newColors = buildColors(config.w.globals.series[config.seriesIndex].length, config.dataPointIndex);
            chartContext.updateOptions({ colors: newColors }, false, false);
          },
          dataPointMouseLeave: (_event, chartContext, config) => {
            const newColors = buildColors(config.w.globals.series[config.seriesIndex].length, null);
            chartContext.updateOptions({ colors: newColors }, false, false);
          },
        },
      },
      plotOptions: {
        bar: {
          distributed: true,
          borderRadius: 8,
          columnWidth: '55%',
          dataLabels: { position: 'top' },
        },
      },
      colors: baseColors,
      dataLabels: {
        enabled: true,
        formatter: (val: number) => formatBRL(val),
        offsetY: -8,
        style: {
          fontSize: '12px',
          fontWeight: 600,
          colors: ['#2d1b4e'],
        },
      },
      stroke: {
        show: true,
        width: 0,
      },
      grid: {
        strokeDashArray: 3,
        padding: { left: 16, right: 16 },
      },
      xaxis: {
        categories,
        labels: {
          rotate: -30,
          rotateAlways: true,
          trim: true,
          minHeight: 70,
          style: { fontSize: '12px', fontWeight: 500 },
        },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => formatBRL(val),
          style: { fontSize: '12px', fontWeight: 500 },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.35,
          inverseColors: false,
          opacityFrom: 0.95,
          opacityTo: 0.75,
          stops: [0, 100],
        },
      },
      legend: { show: false },
      tooltip: {
        y: {
          formatter: (val: number) => formatBRL(val),
          title: {
            formatter: () => 'Total',
          },
        },
      },
      states: {
        normal: { filter: { type: 'none' } },
        hover: { filter: { type: 'none' } },
        active: { filter: { type: 'none' } },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            plotOptions: { bar: { columnWidth: '65%', borderRadius: 6 } },
            dataLabels: { offsetY: -6, style: { fontSize: '11px' } },
            xaxis: { labels: { rotate: -45, style: { fontSize: '11px' }, hideOverlappingLabels: true } },
          },
        },
      ],
    }),
    [baseColors, categories, height]
  );

  const series = useMemo(() => [{ name: 'Totais Mensais', data }], [data]);

  return <ReactApexChart options={options} series={series} type="bar" height={height} />;
}

export default TotaisMensais;
