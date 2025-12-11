import requests
import os
import zipfile
import sys
import json
import urllib.request
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import platform


def get_chrome_for_testing_latest_version():
    """
    Fetch the latest stable ChromeDriver version from Chrome for Testing API
    """
    url = "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json"
    response = requests.get(url)
    data = response.json()
    return data["channels"]["Stable"]["version"]


def download_chromedriver(version):
    """
    Download ChromeDriver for the current operating system
    """
    # Determine the OS and architecture
    os_name = platform.system().lower()
    if os_name == "darwin":
        os_name = "mac"

    arch = platform.machine().lower()
    if arch in ["x86_64", "amd64"]:
        arch = "x64"
    elif arch in ["arm64", "aarch64"]:
        arch = "arm64"

    # Construct the download URL
    download_url = f"https://storage.googleapis.com/chrome-for-testing-public/{version}/{os_name}-{arch}/chromedriver-{os_name}-{arch}.zip"

    # Create downloads directory if it doesn't exist
    os.makedirs("chrome_driver", exist_ok=True)

    # Download the zip file
    zip_path = os.path.join("chrome_driver", "chromedriver.zip")
    urllib.request.urlretrieve(download_url, zip_path)

    # Unzip the file
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        # Extract to chrome_driver directory
        zip_ref.extractall("chrome_driver")

    # Remove the zip file
    os.remove(zip_path)

    # Get the path to the chromedriver executable
    if os_name == "windows":
        chromedriver_path = os.path.join(
            "chrome_driver", "chromedriver-win64", "chromedriver.exe"
        )
    elif os_name == "mac":
        chromedriver_path = os.path.join(
            "chrome_driver", "chromedriver-mac-x64", "chromedriver"
        )
    else:  # Linux
        chromedriver_path = os.path.join(
            "chrome_driver", "chromedriver-linux64", "chromedriver"
        )

    # Make the file executable (for Unix-like systems)
    if os_name != "windows":
        os.chmod(chromedriver_path, 0o755)

    return chromedriver_path


def get_first_image_url(search_term):
    """
    Uses Selenium to search Google Images and extract the first image URL
    """
    # Get the latest ChromeDriver version and download it
    version = get_chrome_for_testing_latest_version()
    chromedriver_path = download_chromedriver(version)

    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in background
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Initialize the webdriver
    service = Service(chromedriver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        # Navigate to Google Images
        driver.get(f"https://www.google.com/search?q={search_term}&tbm=isch")

        # Wait for images to load
        driver.implicitly_wait(10)

        # Find all image elements
        image_elements = driver.find_elements(By.CSS_SELECTOR, "img")

        # Iterate through image elements
        for element in image_elements:
            try:
                # Attempt to get the image source
                image_url = element.get_attribute("src")

                # Check if URL is valid and ends with jpg or jpeg
                if image_url and (
                    image_url.lower().endswith(".jpg")
                    or image_url.lower().endswith(".jpeg")
                ):
                    return image_url
            except Exception as e:
                print(f"Error processing image: {e}")

        return None

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

    finally:
        # Always close the browser
        driver.quit()


# Example usage
search_term = "cute cats"
image_url = get_first_image_url(search_term)

if image_url:
    print(f"The first .jpg or .jpeg image URL for '{search_term}' is: {image_url}")
else:
    print(f"No .jpg or .jpeg image found for '{search_term}'.")
