package tqs.plugpoint.backend.dto;

public record StationStatsDTO(
        double energyDeliveredKWh,
        long   sessions,
        double averageOccupancyPct   // 0-100 %
) {}
