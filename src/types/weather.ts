export interface Coordinates {
    lat: number;
    lon: number;
}

export const UvRisk = [ 'Low', 'Moderate',  'High', 'Very High', 'Extreme' ] as const;

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  uvRisk: typeof UvRisk[number];
}