package tqs.plugpoint.backend.e2e;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.firefox.FirefoxDriver;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.Tag;


@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Tag("e2e")
public class SearchStationsTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    void setupTest() {
        // Configuração do WebDriver para o Firefox
        WebDriverManager.firefoxdriver().setup();
        driver = new FirefoxDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));        
    }


    @AfterEach
    void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void testSearchStationByCity() {
        driver.get("http://localhost:3000/");

        // Localiza input e insere "Aveiro"
        WebElement searchInput = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("input.searchInput")));
        searchInput.sendKeys("Aveiro");

        // Aguarda sugestão e seleciona a cidade
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("dropdown")));
        WebElement suggestion = driver.findElement(By.xpath(
                "//div[contains(@class, 'opt') and text()='Aveiro']"));
        suggestion.click();

        // Aguarda renderização da lista de resultados
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".list")));

        // Verifica se há pelo menos um resultado
        List<WebElement> results = driver.findElements(By.cssSelector(".list li"));
        assertTrue(results.size() > 0, "Esperava encontrar pelo menos uma estação listada para Aveiro.");
    }
}

