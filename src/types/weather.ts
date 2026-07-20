export interface Coordinates {
    lat: number;
    lon: number;
}

export interface WeatherData {
  weather_id: number;
  temperature: number;
  feelsLike: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  sunRise:string;
  sunSet:string;
}