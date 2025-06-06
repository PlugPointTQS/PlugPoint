package tqs.plugpoint.backend.controllers;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tqs.plugpoint.backend.dto.DailyEnergyDTO;
import tqs.plugpoint.backend.dto.StationStatsDTO;
import tqs.plugpoint.backend.services.StatisticsService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StatisticsController.class)
class StatisticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatisticsService statisticsService;

    @Test
    void getStationStats_shouldReturnJson() throws Exception {
        StationStatsDTO dto = new StationStatsDTO(123.4, 2, 76.5);
        Mockito.when(statisticsService.getStats(anyLong(), any(), any())).thenReturn(dto);

        mockMvc.perform(get("/api/admin/stations/1/stats")
                .param("from", "2025-06-01T00:00:00")
                .param("to", "2025-06-01T23:59:59")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.energyDeliveredKWh").value(123.4))
                .andExpect(jsonPath("$.sessions").value(2))
                .andExpect(jsonPath("$.averageOccupancyPct").value(76.5));
    }

    @Test
    void exportStationStatsCsv_shouldReturnCsvContent() throws Exception {
        StationStatsDTO dto = new StationStatsDTO(111.1, 3, 50.0);
        Mockito.when(statisticsService.getStats(anyLong(), any(), any())).thenReturn(dto);

        mockMvc.perform(get("/api/admin/stations/1/stats/export")
                .param("from", "2025-06-01T00:00:00")
                .param("to", "2025-06-02T00:00:00")
                .accept("text/csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("station-1-stats-")))
                .andExpect(content().string(containsString("energyDeliveredKWh,sessions,averageOccupancyPct")))
                .andExpect(content().string(containsString("111.10,3,50.00")));
    }

    @Test
    void getDailyEnergy_shouldReturnListOfDtos() throws Exception {
        List<DailyEnergyDTO> dailyData = List.of(
                new DailyEnergyDTO(LocalDate.of(2025, 6, 1), 10.5),
                new DailyEnergyDTO(LocalDate.of(2025, 6, 2), 20.0));
        Mockito.when(statisticsService.getDailyEnergyByStation(anyLong(), any(), any()))
                .thenReturn(dailyData);

        mockMvc.perform(get("/api/admin/stations/1/stats/daily-energy")
                .param("from", "2025-06-01T00:00:00")
                .param("to", "2025-06-03T00:00:00")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].date").value("2025-06-01"))
                .andExpect(jsonPath("$[0].energyKWh").value(10.5))
                .andExpect(jsonPath("$[1].date").value("2025-06-02"))
                .andExpect(jsonPath("$[1].energyKWh").value(20.0));
    }
}
