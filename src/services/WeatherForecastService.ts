import { Injectable, ServiceLifetime } from 'fw';

export class WeatherForecast {
    date: Date;
    temperatureC: number;
    summary: string;

    get temperatureF() { return 32 + Math.round(this.temperatureC / 0.5556) };

    constructor(date: Date, temperatureC: number, summary: string) {
        this.date = date;
        this.temperatureC = temperatureC;
        this.summary = summary;
    }
}

@Injectable(ServiceLifetime.Singleton)
export class WeatherForecastService {

    public async getWeatherForcast(): Promise<WeatherForecast[]> {

        const startDate = new Date(Date.now());
        var summaries = ["Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"];
        const forecasts = Array.from({ length: 5 }, (_, index) => {
            const date = new Date(startDate.setDate(startDate.getDate() + index));
            const temperatureC = Math.floor(Math.random() * (55 - (-20))) + (-20);
            const summary = summaries[Math.floor(Math.random() * summaries.length)];
            return new WeatherForecast(date, temperatureC, summary);
        });

        return Promise.resolve(forecasts);
    }
}
