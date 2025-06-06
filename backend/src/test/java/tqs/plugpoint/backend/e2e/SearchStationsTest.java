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

import io.github.bonigarcia.wdm.WebDriverManager;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class SearchStationsTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeAll
    void setupClass() {
        // Garante a versão correta do driver para o Chrome 134
        WebDriverManager.chromedriver()
                .browserVersion("134.0.6998.88")
                .setup();
    }

    @BeforeEach
    void setupTest() {
        // Usa o ChromeDriver instalado no sistema
        System.setProperty("webdriver.chrome.driver", "/usr/bin/chromedriver");

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
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

