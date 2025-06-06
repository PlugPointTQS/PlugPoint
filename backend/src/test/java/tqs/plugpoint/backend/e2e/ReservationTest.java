
package tqs.plugpoint.backend.e2e;

import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.*;
import org.openqa.selenium.firefox.*;

import io.github.bonigarcia.wdm.WebDriverManager;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ReservationTest {

    private WebDriver driver;
    private WebDriverWait wait;

  
    @BeforeEach 
    void setup() {

            driver=new FirefoxDriver();
            wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        }


    @AfterEach
    void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void reserveAvailableCharger_shouldShowSuccessAlert() {
        driver.get("http://localhost:3000/");

        // Pesquisa uma cidade conhecida com estações (ex: Aveiro)
        WebElement input = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("input.searchInput")));
        input.sendKeys("Aveiro");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("dropdown")));
        WebElement suggestion = driver.findElement(By.xpath("//div[contains(@class, 'opt') and text()='Aveiro']"));
        suggestion.click();

        // Aguarda lista de estações e clica no botão "Detalhes" da primeira
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".list li")));
        WebElement detailsButton = driver.findElement(By.cssSelector(".list li button"));
        detailsButton.click();

        // Aguarda botões de reserva e clica no primeiro "Reservar"
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".reserve-btn")));
        List<WebElement> reserveButtons = driver.findElements(By.cssSelector(".reserve-btn"));
        Assertions.assertFalse(reserveButtons.isEmpty(), "Nenhum carregador disponível para reservar.");
        reserveButtons.get(0).click();

        // Espera pelo alerta de confirmação e verifica conteúdo
        wait.until(ExpectedConditions.alertIsPresent());
        Alert alert = driver.switchTo().alert();
        String alertText = alert.getText();
        assertTrue(alertText.toLowerCase().contains("reserva criada com sucesso"), "Alerta esperado de sucesso");
        alert.accept();
    }
}
