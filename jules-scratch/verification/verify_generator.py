import os
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the HTML file
    file_path = os.path.abspath('gerador.html')
    page.goto(f'file://{file_path}')

    # --- Test Saving a Profile ---
    page.get_by_label("Nome do Perfil").fill("Teste")
    page.get_by_label("Pescoço", exact=True).fill("37")
    page.get_by_label("Busto", exact=True).fill("88")
    page.get_by_role("button", name="Salvar Perfil e Continuar").click()

    # --- Test Loading a Profile ---
    page.get_by_label("Nome do Perfil").fill("") # Clear the name
    page.get_by_label("Busto", exact=True).fill("0") # Clear a measurement
    page.locator("#profileSelector").select_option("Teste")

    # Wait for the form to populate
    expect(page.get_by_label("Busto", exact=True)).to_have_value("88")

    # --- Test Pattern Generation ---
    page.get_by_role("button", name="Salvar Perfil e Continuar").click()

    # Wait for the SVG to be rendered
    svg_element = page.locator("#patternPreview svg")
    expect(svg_element).to_be_visible(timeout=10000) # Increased timeout

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

print("Screenshot created at jules-scratch/verification/verification.png")
