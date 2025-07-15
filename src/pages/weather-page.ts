import { ComponentBase, html, Inject, route, customElement, state } from 'fw';
import { WeatherForecast, WeatherForecastService } from '../services/WeatherForecastService';

@customElement('weather-page')
@route('/weather')
export class WeatherPage extends ComponentBase {
    render() {
        return html`
      <h1>Weather</h1>
      <p>This component demonstrates showing data.</p>

      ${this.forecasts === undefined
                ? html`<p><em>Loading...</em></p>`
                : html`
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th aria-label="Temperature in Celsius">Temp. (C)</th>
                <th aria-label="Temperature in Fahrenheit">Temp. (F)</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              ${this.forecasts.map(forecast => html`
                <tr>
                  <td>${forecast.date.toLocaleDateString()}</td>
                  <td>${forecast.temperatureC}</td>
                  <td>${forecast.temperatureF}</td>
                  <td>${forecast.summary}</td>
                </tr>
              `)}
            </tbody>
          </table>
        `}
    `;
    }

    //@property({ type: Array }) routeParams = [];
    @state() forecasts: WeatherForecast[] | undefined = undefined;

    @Inject(WeatherForecastService) weatherService!: WeatherForecastService;

    async connectedCallback() {
        super.connectedCallback();
        this.forecasts = await this.weatherService.getWeatherForcast();
    }
}