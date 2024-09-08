import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Función para generar un nick aleatorio
def generar_nick():
    letras = string.ascii_lowercase
    return ''.join(random.choice(letras) for i in range(8))  # Nick de 8 caracteres

# Función para generar un email aleatorio
def generar_email():
    letras = string.ascii_lowercase
    dominio = random.choice(['gmail.com', 'yahoo.com', 'hotmail.com'])
    return ''.join(random.choice(letras) for i in range(8)) + '@' + dominio

# Función para generar un nombre aleatorio
def generar_nombre():
    nombres = ["Juan", "Maria", "Pedro", "Ana", "Carlos", "Luisa", "Miguel", "Fernanda"]
    apellidos = ["Pérez", "López", "García", "Rodríguez", "Martínez", "Gómez", "Fernández"]
    return random.choice(nombres), random.choice(apellidos), random.choice(apellidos)

# Función para generar un CURP aleatorio
def generar_curp():
    letras = string.ascii_uppercase
    genero = ['H', 'F']
    lugar = [
        "AS", "BC", "BS", "CC", "CL", "CM", "CS", "CH", "DF", "DG", "GT", "GR", "HG", 
        "JC", "MC", "MN", "MS", "NT", "NL", "OC", "PL", "QT", "QR", "SP", "SL", "SR", 
        "TC", "TS", "TL", "VZ", "YN", "ZS", "NE"
    ]

    curp = 'CORP230520'
    curp += ''.join(random.choices(genero, k=1)) + ''.join(random.choice(lugar)) + ''.join(random.choices(letras, k=5))
    return curp

# Ruta del GeckoDriver, asegúrate de que esté en tu PATH o especifica su ubicación completa.
driver_path = '/Users/angelsaul/Downloads/geckodriver'  # Ruta completa al ejecutable de geckodriver

# Crear el servicio para GeckoDriver
service = Service(driver_path)

# Opciones para Firefox (opcional)
firefox_options = webdriver.FirefoxOptions()

# Iniciar el driver de Firefox con el servicio adecuado
driver = webdriver.Firefox(service=service, options=firefox_options)

# Navegar a la plataforma AII
driver.get('http://bd3sg-teaaa-aaaaa-qaaba-cai.localhost:8000/')

# Esperar a que la página cargue completamente
time.sleep(.2)

# Generar nick y email aleatorios
nick_aleatorio = generar_nick()
email_aleatorio = generar_email()

# Encontrar el botón de login y hacer clic
connect_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Connect')]")
connect_button.click()

identity_button = driver.find_element(By.XPATH, "//button[@class='button-styles ii-styles']")
identity_button.click()

# Cambiar de pestaña
windows = driver.window_handles
driver.switch_to.window(windows[-1])

create_identity_button = driver.find_element(By.XPATH, "//button[@class='c-button']")
create_identity_button.click()

create_key_button = driver.find_element(By.XPATH, "//button[@class='c-button l-stack']")
create_key_button.click()

set_captcha_input = driver.find_element(By.ID, 'captchaInput')
set_captcha_input.send_keys('a')

time.sleep(3)

send_captcha_button = driver.find_element(By.ID, 'confirmRegisterButton')
send_captcha_button.click()

time.sleep(4.2)

save_identity_button = driver.find_element(By.ID, 'displayUserContinue')
save_identity_button.click()

time.sleep(3.5)

# Cambiar a la pestaña original
driver.switch_to.window(windows[0])

# Llenar el campo de nick con el nick aleatorio generado
set_nick_input = driver.find_element(By.NAME, 'nick')
set_nick_input.send_keys(nick_aleatorio)

# Llenar el campo de email con el email aleatorio generado
set_mail_input = driver.find_element(By.NAME, 'email')
set_mail_input.send_keys(email_aleatorio)

# Clic en el botón de "Registrar Usuario"
register_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Registrar Usuario')]")
register_button.click()

time.sleep(4)
# Abrir el menú
menu = driver.find_element(By.ID, 'basic-nav-dropdown')
menu.click()

# Esperar hasta que el enlace de "Registrar Docente" esté disponible
registrar_docente = driver.find_element(By.XPATH, "//a[contains(text(), 'Registrar Docente')]")
driver.execute_script("arguments[0].scrollIntoView(true);", registrar_docente)
registrar_docente.click()

# Generar datos
nombre, apellidoPaterno, apellidoMaterno = generar_nombre()
curp_aleatorio = generar_curp()
email_aleatorio = generar_email()

# Llenar los campos del formulario de docente
def scroll_and_fill(field_id, value):
    element = driver.find_element(By.ID, field_id)
    driver.execute_script("arguments[0].scrollIntoView(true);", element)
    element.send_keys(value)

# Nombre, apellidos
scroll_and_fill('nombre', nombre)
scroll_and_fill('apellidoPaterno', apellidoPaterno)
scroll_and_fill('apellidoMaterno', apellidoMaterno)

# Tipo sanguíneo
tipo_sanguineo = Select(driver.find_element(By.ID, 'tipoSanguineo'))
driver.execute_script("arguments[0].scrollIntoView(true);", tipo_sanguineo._el)
tipo_sanguineo.select_by_visible_text('O+')

# CURP
scroll_and_fill('curp', curp_aleatorio)

# Estado civil
estado_civil_element = driver.find_element(By.ID, 'estadoCivil')
driver.execute_script("arguments[0].scrollIntoView(true);", estado_civil_element)
estado_civil = Select(estado_civil_element)
estado_civil.select_by_visible_text('Soltero/a')

# Email Personal
scroll_and_fill('emailPersonal', email_aleatorio)

# Dirección
scroll_and_fill('direccion0', 'Calle Falsa #123')

# Teléfono
scroll_and_fill('telefono0', '5512345678')

# Detalles Médicos
scroll_and_fill('detallesMedicos', 'Sin alergias')

# Número de Seguro Social
scroll_and_fill('numeroSeguroSocial', '98765432101')

# Cédula Profesional
scroll_and_fill('cedulaProfesional', '123456789')

# # Materia
# materia = Select(driver.find_element(By.ID, 'materia0'))
# driver.execute_script("arguments[0].scrollIntoView(true);", materia._el)
# materia.select_by_index(1)  # Selecciona la primera materia disponible

# Hacer clic en el botón de "Registrar"
register_button = driver.find_element(By.XPATH, "//button[text()='Registrar']")
driver.execute_script("arguments[0].scrollIntoView(true);", register_button)
register_button.click()
