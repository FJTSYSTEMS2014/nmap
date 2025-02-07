let currentToolId = '';
let searchMode = 'current'; // Modo de búsqueda por defecto
let toolsData = {};
// Variables globales para el cifrado cuántico
let quantumEncryptionKey = "";
let quantumEncryptedDataStore = "";

// Cargar datos desde tools.json
fetch('tools.json')
  .then(response => response.json())
  .then(data => {
    toolsData = data;
    generateTabs(); // Generar pestañas dinámicamente
    loadTab(toolsData.tools[0].id); // Cargar la primera pestaña por defecto
  });

// Generar pestañas dinámicamente
function generateTabs() {
  const nav = document.querySelector('nav');
  toolsData.tools.forEach(tool => {
    const button = document.createElement('button');
    button.textContent = tool.name;
    button.onclick = () => loadTab(tool.id);
    nav.appendChild(button);
  });
  // Añadir pestañas fijas (Recursos y Esteganografía)
  const resourcesButton = document.createElement('button');
  resourcesButton.textContent = 'Recursos';
  resourcesButton.onclick = () => loadTab('resources');
  nav.appendChild(resourcesButton);

  const steganographyButton = document.createElement('button');
  steganographyButton.textContent = 'Esteganografía';
  steganographyButton.onclick = () => loadTab('steganography');
  nav.appendChild(steganographyButton);

  // Add User Info tab
  const userInfoButton = document.createElement('button');
  userInfoButton.textContent = 'Información de Usuario';
  userInfoButton.onclick = () => getUserInfo();
  nav.appendChild(userInfoButton);

  const cryptographyButton = document.createElement('button');
  cryptographyButton.textContent = 'Criptografía';
  cryptographyButton.onclick = () => loadTab('cryptography');
  nav.appendChild(cryptographyButton);

}

// Cargar contenido dinámico
function loadTab(toolId) {
  currentToolId = toolId; // Actualizar la pestaña actual
  const content = document.getElementById('content');
  if (toolId === 'resources') {
    content.innerHTML = `<h2>Recursos</h2>
      <h3>Libros</h3>
      <ul>
        ${toolsData.resources.books.map(book => `
          <li><a href="${book.downloadUrl}" target="_blank">${book.title}</a> - ${book.author}</li>
        `).join('')}
      </ul>
      <h3>Videos</h3>
      <ul>
        ${toolsData.resources.videos.map(video => `
          <li><a href="${video.url}" target="_blank">${video.title}</a> - ${video.author}</li>
        `).join('')}
      </ul>`;
  } else if (toolId === 'steganography') {
    content.innerHTML = `  <div id="steganography-container">
        
        <div class="steganography-controls">
        <h2>Esteganografía</h2>
          <input type="file" id="image-upload" accept="image/*">
          <textarea id="secret-message" placeholder="Escribe un mensaje secreto..."></textarea>
          <div class="action-buttons">
            <button onclick="encodeMessage()">Ocultar Mensaje</button>
            <button onclick="decodeMessage()">Extraer Mensaje</button>
            <button id="save-image" onclick="saveEncodedImage()" style="display:none;">Guardar Imagen</button>
            <button id="clear-steganography" onclick="clearSteganography()" style="display:none;">Limpiar</button>
          </div>
        </div>
        <div class="image-preview">
          <img id="output-image" src="" alt="" style="display: none; max-width: 100%; height: auto;">
        </div>
      </div>`;
  } else if (toolId === 'cryptography') {
    content.innerHTML = `
       
        <div class="cryptography-container">
         <h2 >Criptografía</h2>
          <div class="encryption-options">
            <select id="encryption-type" onchange="updateEncryptionUI()">
              <option value="quantum">Cifrado Cuántico de Franck</option>
              <option value="caesar">Cifrado César</option>
              <option value="symbols">Cifrado con Símbolos</option>
              <option value="morse">Código Morse</option>
            
            </select>
          </div>
  
          <div class="encryption-input">
            <textarea id="input-text" placeholder="Introduce el texto a cifrar o descifrar..." class="crypto-textarea"></textarea>
          
            <div id="quantum-key" class="encryption-specific-options" style="display: none;">
              <input type="text" id="quantum-key-display" readonly placeholder="La clave cuántica aparecerá aquí">
            </div>
            
            <div id="caesar-options" class="encryption-specific-options">
              <input type="number" id="shift" placeholder="Desplazamiento (1-25)" min="1" max="25" value="3"> Solo para Cifrado César
            </div>
  

  
            <div class="encryption-buttons">
              <button onclick="encryptText()" class="crypto-button">Cifrar</button>
              <button onclick="decryptText()" class="crypto-button">Descifrar</button>
              <button onclick="copyToClipboard('output-text')" class="crypto-button">Copiar Resultado</button>
              <button onclick="clearCrypto()" class="crypto-button">Limpiar</button>
            </div>
  
            <textarea id="output-text" placeholder="Resultado aparecerá aquí..." class="crypto-textarea" readonly></textarea>
          </div>
        </div>`;
  }


  else {
    const tool = toolsData.tools.find(t => t.id === toolId);
    content.innerHTML = `<h2>${tool.name}</h2>
      <p>${tool.description}</p>
      <ul>
        ${tool.commands.map(cmd => `
          <li>
            <strong>${cmd.title}</strong><br>
            <code>${cmd.command}</code><br>
            <p>${cmd.description}</p>
          </li>
        `).join('')}
      </ul>`;
  }
}

// Filtrar comandos
function filterCommands() {
  const searchTerm = document.getElementById('search').value.toLowerCase();
  const content = document.getElementById('content');
  const searchMode = document.getElementById('search-mode').value;

  if (searchMode === 'current') {
    // Búsqueda en la pestaña actual
    if (currentToolId === 'resources' || currentToolId === 'steganography') {
      return; // No hay comandos para buscar en estas pestañas
    }
    const tool = toolsData.tools.find(t => t.id === currentToolId);
    if (tool) {
      const filteredCommands = tool.commands.filter(cmd =>
        cmd.title.toLowerCase().includes(searchTerm) ||
        cmd.command.toLowerCase().includes(searchTerm) ||
        cmd.description.toLowerCase().includes(searchTerm)
      );
      content.innerHTML = `<h2>${tool.name}</h2>
        <p>${tool.description}</p>
        <ul id="commands-list">
          ${filteredCommands.map(cmd => `
            <li>
              <strong>${cmd.title}</strong><br>
              <code>${cmd.command}</code><br>
              <p>${cmd.description}</p>
            </li>
          `).join('')}
        </ul>`;
    }
  } else {
    // Búsqueda global
    let results = [];
    toolsData.tools.forEach(tool => {
      tool.commands.forEach(cmd => {
        if (
          cmd.title.toLowerCase().includes(searchTerm) ||
          cmd.command.toLowerCase().includes(searchTerm) ||
          cmd.description.toLowerCase().includes(searchTerm)
        ) {
          results.push({ tool: tool.name, ...cmd });
        }
      });
    });

    if (results.length > 0) {
      content.innerHTML = `<h2>Resultados de la búsqueda</h2>
        <ul id="commands-list">
          ${results.map(cmd => `
            <li>
              <strong>${cmd.tool}: ${cmd.title}</strong><br>
              <code>${cmd.command}</code><br>
              <p>${cmd.description}</p>
            </li>
          `).join('')}
        </ul>`;
    } else {
      content.innerHTML = `<h2>Resultados de la búsqueda</h2>
        <p>No se encontraron resultados para "${searchTerm}".</p>`;
    }
  }
}

// Cambiar tema
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const themeButton = document.getElementById('theme-toggle');
  themeButton.textContent = document.body.classList.contains('dark-mode') ? 'Modo Claro' : 'Modo Oscuro';
}

// Funciones de esteganografía (simuladas)
// Enhanced Steganography Functions

function resizeImage(img, maxWidth = 600, maxHeight = 600) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Calculate new dimensions while maintaining aspect ratio
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height *= maxWidth / width;
    width = maxWidth;
  }

  if (height > maxHeight) {
    width *= maxHeight / height;
    height = maxHeight;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function encodeMessage() {
  const imageUpload = document.getElementById('image-upload');
  const secretMessage = document.getElementById('secret-message').value;
  const outputImage = document.getElementById('output-image');
  const saveButton = document.getElementById('save-image');
  const clearButton = document.getElementById('clear-steganography');

  if (!imageUpload.files[0] || !secretMessage) {
    alert('Por favor, selecciona una imagen y escribe un mensaje.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Resize image first
      const resizedCanvas = resizeImage(img);
      const ctx = resizedCanvas.getContext('2d');

      // Convert message to binary
      const encodedMessage = stringToBinary(secretMessage);

      // Get image data
      const imageData = ctx.getImageData(0, 0, resizedCanvas.width, resizedCanvas.height);
      const data = imageData.data;

      // Hide message in least significant bits
      let messageIndex = 0;
      for (let i = 0; i < data.length; i += 4) {
        // Only modify alpha and color channels
        for (let j = 0; j < 3; j++) {
          if (messageIndex < encodedMessage.length) {
            // Modify the least significant bit
            data[i + j] = (data[i + j] & 0xFE) | parseInt(encodedMessage[messageIndex]);
            messageIndex++;
          } else {
            break;
          }
        }

        if (messageIndex >= encodedMessage.length) break;
      }

      // Put modified image data back
      ctx.putImageData(imageData, 0, 0);

      // Show output image
      outputImage.src = resizedCanvas.toDataURL('image/png');
      outputImage.style.display = 'block';

      // Enable save and clear buttons
      saveButton.style.display = 'inline-block';
      clearButton.style.display = 'inline-block';

      alert('Mensaje oculto en la imagen con éxito.');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(imageUpload.files[0]);
}

function decodeMessage() {
  const imageUpload = document.getElementById('image-upload');
  const secretMessageArea = document.getElementById('secret-message');

  if (!imageUpload.files[0]) {
    alert('Por favor, selecciona una imagen.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Resize image for processing
      const resizedCanvas = resizeImage(img);
      const ctx = resizedCanvas.getContext('2d');

      // Get image data
      const imageData = ctx.getImageData(0, 0, resizedCanvas.width, resizedCanvas.height);
      const data = imageData.data;

      // Extract hidden message
      let binaryMessage = '';
      for (let i = 0; i < data.length; i += 4) {
        // Extract least significant bits
        for (let j = 0; j < 3; j++) {
          binaryMessage += (data[i + j] & 1);

          // Stop if we have a complete byte
          if (binaryMessage.length % 8 === 0) {
            const byte = binaryMessage.slice(-8);
            // Check for end of message marker
            if (byte === '00000000') {
              // Remove end marker and convert to text
              const extractedMessage = binaryToString(binaryMessage.slice(0, -8));
              secretMessageArea.value = extractedMessage;
              return;
            }
          }
        }
      }

      alert('No se encontró ningún mensaje oculto.');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(imageUpload.files[0]);
}

function saveEncodedImage() {
  const outputImage = document.getElementById('output-image');
  const link = document.createElement('a');
  link.download = 'imagen_con_mensaje_oculto.png';
  link.href = outputImage.src;
  link.click();
}

function clearSteganography() {
  document.getElementById('image-upload').value = '';
  document.getElementById('secret-message').value = '';
  document.getElementById('output-image').src = '';
  document.getElementById('output-image').style.display = 'none';
  document.getElementById('save-image').style.display = 'none';
  document.getElementById('clear-steganography').style.display = 'none';
}

// Utility functions for binary conversion (same as before)
function stringToBinary(str) {
  let binary = '';
  for (let i = 0; i < str.length; i++) {
    let charBinary = str.charCodeAt(i).toString(2);
    // Pad to 8 bits
    charBinary = charBinary.padStart(8, '0');
    binary += charBinary;
  }
  // Add end of message marker
  return binary + '00000000';
}

function binaryToString(binary) {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
}


// Function to get user device and network information
async function getUserInfo() {
  const content = document.getElementById('content');

  // Create a container for user information
  content.innerHTML = `<h2>Información del Usuario y Dispositivo</h2>
    <div id="user-info-container">
      <h3>Cargando información...</h3>
    </div>`;

  try {
    // Gather local device information
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency || 'Desconocido',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Get public IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();

    // Get geolocation information
    const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
    const geoData = await geoResponse.json();

    // Prepare HTML to display information
    content.innerHTML = `
      <h2>Información del Usuario y Dispositivo</h2>
      <div id="user-info-container">
        <h3>Información de Red</h3>
        <ul>
          <li><strong>Dirección IP Pública:</strong> ${ipData.ip}</li>
          <li><strong>Ciudad:</strong> ${geoData.city || 'Desconocida'}</li>
          <li><strong>Región:</strong> ${geoData.region || 'Desconocida'}</li>
          <li><strong>País:</strong> ${geoData.country_name || 'Desconocido'}</li>
          <li><strong>Proveedor de Internet:</strong> ${geoData.org || 'Desconocido'}</li>
        </ul>

        <h3>Información del Dispositivo</h3>
        <ul>
          <li><strong>Sistema Operativo:</strong> ${deviceInfo.platform}</li>
          <li><strong>Navegador:</strong> ${navigator.userAgent}</li>
          <li><strong>Idioma:</strong> ${deviceInfo.language}</li>
          <li><strong>Resolución de Pantalla:</strong> ${deviceInfo.screenWidth} x ${deviceInfo.screenHeight}</li>
          <li><strong>Profundidad de Color:</strong> ${deviceInfo.colorDepth} bits</li>
          <li><strong>Ratio de Píxeles:</strong> ${deviceInfo.pixelRatio}</li>
          <li><strong>Núcleos de CPU:</strong> ${deviceInfo.hardwareConcurrency}</li>
          <li><strong>Zona Horaria:</strong> ${deviceInfo.timezone}</li>
        </ul>
      </div>
    `;
  } catch (error) {
    content.innerHTML = `
      <h2>Información del Usuario y Dispositivo</h2>
      <div id="user-info-container">
        <h3>Error al cargar información</h3>
        <p>No se pudo obtener la información. ${error.message}</p>
      </div>
    `;
  }
}

// Modifica esta parte en tu script.js

// Esperamos a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
  const scrollToTopButton = document.getElementById('scroll-to-top');

  // Función para manejar el scroll
  function handleScroll() {
    // Para debugging
    console.log('Scroll position:', window.pageYOffset);

    // Mostrar el botón cuando se haya bajado 100px (reducido de 200px)
    if (window.pageYOffset > 100) {
      scrollToTopButton.classList.add('visible');
      console.log('Button should be visible');
    } else {
      scrollToTopButton.classList.remove('visible');
      console.log('Button should be hidden');
    }
  }

  // Función para volver arriba
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Event listeners
  window.addEventListener('scroll', handleScroll);
  scrollToTopButton.addEventListener('click', scrollToTop);

  // Verificar estado inicial
  handleScroll();
});


// Cifrar texto
// Agregar al archivo script.js

// Diccionarios de cifrado
const symbolsDict = {
  ' ': '♠', 'e': '♫', 'i': '◙', 'a': '¿♀', 'o': '#☼', 'u': '♂',
  'h': '►', 'c': '◄', 't': '↕', 'f': '¶', 'k': '§', 'r': '▬',
  'n': '↨', 'm': '↑', 'b': '↓', 'd': '→', 'g': '←', 'j': '∟',
  'l': '↔', 'p': '▲', 'q': '▼', 'w': '☺', 'y': '♥', 'z': '♦',
  '1': '♣', '2': '´', '3': '¾', '4': '~', '5': '⌂', '6': 'Ç',
  '7': 'æ', '8': '`', '9': '•', '0': '■'
};

const morseDict = {
  'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.',
  'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
  'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.',
  's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
  'y': '-.--', 'z': '--..', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '0': '-----', ' ': '/'
};

// Función para actualizar la UI según el tipo de cifrado
function updateEncryptionUI() {
  const encryptionType = document.getElementById('encryption-type').value;
  const caesarOptions = document.getElementById('caesar-options');
  const quantumKey = document.getElementById('quantum-key');

  caesarOptions.style.display = encryptionType === 'caesar' ? 'flex' : 'none';
  quantumKey.style.display = encryptionType === 'quantum' ? 'flex' : 'none';
}

// Función principal de cifrado
function encryptText() {
  const inputText = document.getElementById('input-text').value.toLowerCase();
  const encryptionType = document.getElementById('encryption-type').value;
  let result = '';

  switch (encryptionType) {
    case 'quantum':
      result = quantumEncrypt(inputText);
      break;
    case 'caesar':
      const shift = parseInt(document.getElementById('shift').value, 10);
      result = caesarCipher(inputText, shift);
      break;
    case 'symbols':
      result = symbolsCipher(inputText);
      break;
    case 'morse':
      result = textToMorse(inputText);
      break;
  }

  document.getElementById('output-text').value = result;
}

// Función principal de descifrado
function decryptText() {
  const inputText = document.getElementById('input-text').value;
  const encryptionType = document.getElementById('encryption-type').value;
  let result = '';

  switch (encryptionType) {
    case 'quantum':
      result = quantumDecrypt();
      break;
    case 'caesar':
      const shift = parseInt(document.getElementById('shift').value, 10);
      result = caesarCipher(inputText, -shift);
      break;
    case 'symbols':
      result = symbolsDecipher(inputText);
      break;
    case 'morse':
      result = morseToText(inputText);
      break;
  }

  document.getElementById('output-text').value = result;
}

// Cifrado con símbolos
function symbolsCipher(text) {
  return text.toLowerCase().split('').map(char => symbolsDict[char] || char).join('');
}

// Descifrado con símbolos
function symbolsDecipher(text) {
  const reversedDict = Object.fromEntries(
    Object.entries(symbolsDict).map(([key, value]) => [value, key])
  );

  // Buscar coincidencias más largas primero
  const symbols = Object.keys(reversedDict).sort((a, b) => b.length - a.length);
  let result = '';
  let remainingText = text;

  while (remainingText.length > 0) {
    let found = false;
    for (const symbol of symbols) {
      if (remainingText.startsWith(symbol)) {
        result += reversedDict[symbol];
        remainingText = remainingText.slice(symbol.length);
        found = true;
        break;
      }
    }
    if (!found) {
      result += remainingText[0];
      remainingText = remainingText.slice(1);
    }
  }

  return result;
}

// Texto a Morse
function textToMorse(text) {
  return text.toLowerCase().split('').map(char => morseDict[char] || char).join(' ');
}

// Morse a texto
function morseToText(morse) {
  const reversedMorse = Object.fromEntries(
    Object.entries(morseDict).map(([key, value]) => [value, key])
  );
  return morse.split(' ').map(code => reversedMorse[code] || code).join('');
}

// Función para copiar al portapapeles
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  element.select();
  document.execCommand('copy');
  alert('Texto copiado al portapapeles');
}

// Función para limpiar los campos
function clearCrypto() {
  document.getElementById('input-text').value = '';
  document.getElementById('output-text').value = '';
  document.getElementById('quantum-key-display').value = '';
  quantumEncryptionKey = "";
  quantumEncryptedDataStore = "";
}

// Funciones de cifrado cuántico
function quantumEncrypt(text) {
  let encryptedData = [];
  let key = [];
  let originalChars = [];

  for (let char of text) {
    let originalValue = char.charCodeAt(0);
    let possibleValues = [
      originalValue + Math.floor(Math.random() * 6) - 3,
      originalValue,
      originalValue + Math.floor(Math.random() * 6) - 3
    ];
    let actualIndex = 1; // El valor original siempre está en la posición 1
    key.push(actualIndex);
    encryptedData.push(possibleValues.join(","));
    originalChars.push(originalValue);
  }

  quantumEncryptionKey = key.join(",");
  quantumEncryptedDataStore = encryptedData.join("|");

  // Mostrar la clave en la interfaz
  document.getElementById('quantum-key-display').value = quantumEncryptionKey;

  return `${quantumEncryptedDataStore}\nClave: ${quantumEncryptionKey}`;
}

function quantumDecrypt() {
  if (!quantumEncryptionKey || !quantumEncryptedDataStore) {
    alert("No hay datos cuánticos disponibles para descifrar.");
    return "";
  }

  const encryptedData = quantumEncryptedDataStore.split("|");
  const key = quantumEncryptionKey.split(",").map(Number);
  let decryptedText = "";

  encryptedData.forEach((group, index) => {
    let possibleValues = group.split(",").map(Number);
    decryptedText += String.fromCharCode(possibleValues[key[index]]);
  });

  return decryptedText;
}


// Algoritmo de Cifrado César
function caesarCipher(text, shift) {
  return text
    .split('')
    .map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const shiftAmount = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - shiftAmount + shift) % 26) + shiftAmount);
      }
      return char;
    })
    .join('');
}