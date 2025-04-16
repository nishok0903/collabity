import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class LoginTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()  # Or webdriver.Firefox(), etc.
        cls.driver.get("http://localhost:3000/")
        cls.wait = WebDriverWait(cls.driver, 15)

    def test_login_success(self):
        driver = self.driver
        wait = self.wait

        # Fill in email
        email_input = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'input[type="email"][placeholder="Email"]')
        ))
        email_input.clear()
        email_input.send_keys("trial@coll.test")  # Replace with a valid user

        # Fill in password
        password_input = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'input[placeholder="Password"]')
        ))
        password_input.clear()
        # Replace with a valid password
        password_input.send_keys("Test@1234")

        # Click login button
        submit_button = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, 'button[type="submit"]')
        ))
        submit_button.click()

        # Handle alert after successful login
        alert = wait.until(EC.alert_is_present())
        self.assertIn("logged in successfully", alert.text.lower())
        alert.accept()

        # Wait for successful redirect
        wait.until(
            EC.any_of(
                EC.url_contains("/feed"),
                EC.url_contains("/create-topic"),
            )
        )

        # Assert redirect occurred
        current_url = driver.current_url
        self.assertTrue(
            "/feed" in current_url or "/create-topic" in current_url,
            f"Expected redirect URL to contain '/feed' or '/create-topic', got: {current_url}"
        )

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()


if __name__ == "__main__":
    unittest.main()
