package tqs.plugpoint.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StationAvailabilityDTO {
    private Long stationId;
    private String stationName;
    private long availableChargers;
}
