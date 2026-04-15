using System.Text.Json;

namespace IREST.API.Services
{
    public class GeocodingResult
    {
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }

    public class GeocodingService
    {
        private readonly HttpClient _httpClient;

        public GeocodingService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("IREST-API/1.0");
        }

        /// <summary>
        /// Geocodifica um endereço usando Nominatim (OpenStreetMap).
        /// Retorna lat/lng ou null se não encontrar.
        /// </summary>
        public async Task<GeocodingResult?> GeocodeAsync(string? endereco, string cidade, string? estado)
        {
            try
            {
                var query = !string.IsNullOrWhiteSpace(endereco)
                    ? $"{endereco}, {cidade}, {estado ?? "Brasil"}"
                    : $"{cidade}, {estado ?? "Brasil"}";

                var url = $"https://nominatim.openstreetmap.org/search?format=json&q={Uri.EscapeDataString(query)}&limit=1&countrycodes=br";

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return null;

                var json = await response.Content.ReadAsStringAsync();
                var results = JsonSerializer.Deserialize<List<NominatimResult>>(json);

                if (results == null || results.Count == 0) return null;

                return new GeocodingResult
                {
                    Latitude = decimal.Parse(results[0].Lat, System.Globalization.CultureInfo.InvariantCulture),
                    Longitude = decimal.Parse(results[0].Lon, System.Globalization.CultureInfo.InvariantCulture)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Geocoding error: {ex.Message}");
                return null;
            }
        }

        private class NominatimResult
        {
            public string Lat { get; set; } = string.Empty;
            public string Lon { get; set; } = string.Empty;
        }
    }
}
