document.addEventListener('DOMContentLoaded', () => {
    const patternForm = document.getElementById('pattern-form');

    if (patternForm) {
        patternForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const loadingSpinner = document.getElementById('loading-spinner');
            const patternPreview = document.getElementById('pattern-preview');

            loadingSpinner.classList.remove('hidden');
            patternPreview.classList.add('hidden');

            const formData = new FormData(patternForm);
            const data = Object.fromEntries(formData.entries());

            // Form validation
            if (!data.bust || !data.waist || !data.hips || !data.height) {
                alert('Please fill out all required measurement fields.');
                loadingSpinner.classList.add('hidden');
                return;
            }

            if (data.bust <= 0 || data.waist <= 0 || data.hips <= 0 || data.height <= 0) {
                alert('Measurements must be positive numbers.');
                loadingSpinner.classList.add('hidden');
                return;
            }

            setTimeout(() => {
                const result = generatePattern(data);

                loadingSpinner.classList.add('hidden');
                patternPreview.classList.remove('hidden');

                const patternImage = document.getElementById('pattern-image');
                patternImage.src = result.image;

                const downloadPdfButton = document.getElementById('download-pdf');
                downloadPdfButton.onclick = () => {
                    downloadPDF(data);
                };
            }, 2000);
        });
    }
});

function generatePattern(data) {
    // In a real application, this would be an API call to an AI model
    return {
        image: 'images/mock-pattern.svg', // Placeholder for the generated pattern
        message: 'Your custom pattern is ready!'
    };
}

function downloadPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Costureira Sula - Custom Sewing Pattern", 20, 20);
    doc.text(`Garment Type: ${data['garment-type']}`, 20, 30);
    doc.text("Measurements:", 20, 40);
    doc.text(`- Bust: ${data.bust} cm`, 20, 50);
    doc.text(`- Waist: ${data.waist} cm`, 20, 60);
    doc.text(`- Hips: ${data.hips} cm`, 20, 70);
    doc.text(`- Height: ${data.height} cm`, 20, 80);
    if (data['sleeve-length']) {
        doc.text(`- Sleeve Length: ${data['sleeve-length']} cm`, 20, 90);
    }

    // In a real application, you would add the pattern graphics to the PDF
    doc.text("Pattern preview:", 20, 110);
    doc.addImage('images/mock-pattern.svg', 'SVG', 20, 120, 170, 150);

    doc.save("costureira-sula-pattern.pdf");
}
