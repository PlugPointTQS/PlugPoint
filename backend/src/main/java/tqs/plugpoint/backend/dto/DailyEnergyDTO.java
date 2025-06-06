package tqs.plugpoint.backend.dto;

import java.time.LocalDate;

public class DailyEnergyDTO {
    private LocalDate date;
    private double energyKWh;

    public DailyEnergyDTO(LocalDate date, double energyKWh) {
        this.date = date;
        this.energyKWh = energyKWh;
    }

    public LocalDate getDate() {
        return date;
    }

    public double getEnergyKWh() {
        return energyKWh;
    }
}
