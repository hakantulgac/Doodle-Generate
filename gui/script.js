document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const clearButton = document.getElementById('clear-button');
    const saveButton = document.getElementById('save-button');
    const themeToggle = document.getElementById('theme-toggle');
    const broomImg = document.getElementById('broom-img');
    const loader = document.getElementById('loader');
    const generateButton = document.getElementById('generate-button');
    const resultText = '';

    canvas.width = 500;
    canvas.height = 500;

    ctx.strokeStyle = '#238eea';

    ctx.lineWidth = 5;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    let undoStack = [];

    function draw(e) {
        if (!isDrawing) return;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];

        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
        draw(e);
    });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    clearButton.addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        undoStack = [];
    });

    saveButton.addEventListener('click', function () {
        const imgData = canvas.toDataURL('image/png');
        predictImage(imgData)
    });

    themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('light-mode');

        if (document.body.classList.contains('light-mode')) {
            themeToggle.src = "images/moon.png"
            broomImg.src = "images/broom_dark.png"
        } else {
            themeToggle.src = "images/sun.png"
            broomImg.src = "images/broom_light.png"
        }
    });

    generateButton.addEventListener('click', function() {
        generateEvent();
    })
});

function predictImage(image) {
    const formData = new FormData();
    formData.append('file', dataURItoBlob(image), 'cizim.png');
    loader.style = "visibility: visible; height: 50px;";
    document.getElementById('generate-field').style = "visibility: hidden;";
    document.getElementById('result').style = "visibility: hidden;";
    axios.post('http://10.192.118.195:5000/predict', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
        .then(function (response) {
            resultText = response.data.predicted_class;
            document.getElementById('result').innerText = 'Predicted Class: ' + resultText;
            document.getElementById('generate-field').style = "visibility: visible;";
            document.getElementById('result').style = "visibility: visible;";
            loader.style = "visibility: hidden; height: 0px;";
        })
        .catch(function (error) {
            loader.style = "visibility: hidden; height: 0px;";
            alert(error);
        });
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], { type: mimeString });
    return blob;
}

async function generateEvent() {
    const contentGenerate = document.getElementById('content-right');
    const contentProcess = document.getElementById('content-process');
    const generatedImage = document.getElementById('generated-image');
    const api_key = "sk-W1bADWvuatExmVmy8cbfGwcJNhv1oHeoUSoYc9mQVEjdiReJ";

    contentProcess.style = 'display: block;';
    const token = api_key;
    const requestData = {
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        sampler: 'K_DPM_2_ANCESTRAL',
        samples: 1,
        steps: 30,
        text_prompts: [{ text : resultText, weight: 1 }]
    };

    try {

        const response = await axios.post('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        generatedImage.src = "data:image/png;base64,"+ response.data.artifacts[0].base64;

        contentProcess.style = 'display: none;';
        contentGenerate.style = 'display: block;';


    } catch (error) {
        alert(error);
    }

};