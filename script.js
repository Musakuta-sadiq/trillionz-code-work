 <script>
        // ===== CONFIGURATION =====
        // REPLACE THIS WITH YOUR ACTUAL MICROSOFT FORMS LINK
        const MICROSOFT_FORMS_LINK = "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAANAAQBXvzBUNzJGQ0NIUElFR1JROUJWUDBQQlE0MkhNTy4u";
        
        // Mocktail prices
        const mocktailPrices = {
            'Tropical Sunrise': 500,
            'Berry Bliss': 450,
            'Minty Mojito': 650,
            'Citrus Splash': 700,
            'Coconut Dream': 800,
            'Sparkling Royale': 900,
            'custom': 0.00
        };
        
        // ===== STATE MANAGEMENT =====
        let currentStep = 1;
        const deliveryFee = 1000;
        let generatedOrderId = '';
        
        // ===== INITIALIZATION =====
        document.addEventListener('DOMContentLoaded', function() {
            // Set minimum dates
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('event-date').min = today;
            document.getElementById('delivery-date').min = today;
            
            // Set default delivery date (tomorrow)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('delivery-date').value = tomorrow.toISOString().split('T')[0];
            
            // Set default delivery time
            document.getElementById('delivery-time').value = '2:00 PM';
            
            // Set today's date for order date
            document.getElementById('event-date').value = today;
            
            // Initialize totals
            calculateTotals();
            
            // Setup Microsoft Forms button
            document.getElementById('open-form-btn').onclick = function() {
                if (MICROSOFT_FORMS_LINK.includes('YOUR_FORM_ID')) {
                    alert('Please update the Microsoft Forms link in the configuration first!');
                    return;
                }
                window.open(MICROSOFT_FORMS_LINK, '_blank');
            };
        });
        
        // ===== STEP NAVIGATION =====
        function nextStep(step) {
            if (validateStep(currentStep)) {
                showStep(step);
            }
        }
        
        function prevStep(step) {
            showStep(step);
        }
        
        function showStep(step) {
            // Hide all steps
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected step
            document.getElementById(`step${step}`).classList.add('active');
            
            // Update steps in sidebar
            document.querySelectorAll('.step').forEach(stepEl => {
                stepEl.classList.remove('active', 'completed');
                const stepNum = parseInt(stepEl.dataset.step);
                
                if (stepNum < step) {
                    stepEl.classList.add('completed');
                } else if (stepNum === step) {
                    stepEl.classList.add('active');
                }
            });
            
            currentStep = step;
            
            // Scroll to top of form
            document.querySelector('.form-area').scrollTop = 0;
        }
        
        // ===== FORM VALIDATION =====
        function validateStep(step) {
            let isValid = true;
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            
            if (step === 1) {
                const name = document.getElementById('full-name').value.trim();
                const phone = document.getElementById('phone').value.trim();
                
                if (!name) {
                    showError('name-error', 'Please enter your full name');
                    isValid = false;
                }
                
                if (!phone || phone.length < 11) {
                    showError('phone-error', 'Please enter a valid phone number (at least 11 digits)');
                    isValid = false;
                }
            }
            
            if (step === 2) {
                // Check if at least one item is selected
                let hasValidItem = false;
                document.querySelectorAll('.item-name').forEach(select => {
                    if (select.value && select.value !== 'custom') {
                        const price = parseFloat(select.closest('tr').querySelector('.item-price').value) || 0;
                        if (price > 0) hasValidItem = true;
                    }
                });
                
                if (!hasValidItem) {
                    alert('Please add at least one mocktail to your order');
                    isValid = false;
                }
            }
            
            if (step === 3) {
                const deliveryDate = document.getElementById('delivery-date').value;
                const deliveryTime = document.getElementById('delivery-time').value.trim();
                const address = document.getElementById('delivery-address').value.trim();
                
                if (!deliveryDate) {
                    showError('delivery-date-error', 'Please select a delivery date');
                    isValid = false;
                }
                
                if (!deliveryTime) {
                    showError('delivery-time-error', 'Please enter a delivery time');
                    isValid = false;
                }
                
                if (!address) {
                    showError('address-error', 'Please enter a delivery address');
                    isValid = false;
                }
            }
            
            return isValid;
        }
        
        function showError(elementId, message) {
            const element = document.getElementById(elementId);
            element.textContent = message;
            element.style.display = 'block';
            element.style.color = 'var(--danger)';
            element.style.fontSize = '0.9rem';
            element.style.marginTop = '5px';
        }
        
        // ===== ORDER ITEMS MANAGEMENT =====
        function addItemRow() {
            const tbody = document.getElementById('order-items');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>
                    <select class="item-name" onchange="updateItemPrice(this)">
                        <option value="">Select mocktail</option>
                        <option value="Tropical Sunrise" data-price="500">Tropical Sunrise</option>
                        <option value="Berry Bliss" data-price="450">Berry Bliss</option>
                        <option value="Minty Mojito" data-price="650">Minty Mojito</option>
                        <option value="Citrus Splash" data-price="700">Citrus Splash</option>
                        <option value="Coconut Dream" data-price="800">Coconut Dream</option>
                        <option value="Sparkling Royale" data-price="900">Sparkling Royale</option>
                        <option value="custom">Custom Order</option>
                    </select>
                </td>
                <td><input type="number" class="item-qty" min="1" value="1" onchange="calculateTotals()"></td>
                <td><input type="text" class="item-price" placeholder="N0.00" readonly></td>
                <td class="item-total">N0.00</td>
                <td>
                    <button class="remove-btn" onclick="removeItemRow(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(newRow);
            
            // Enable remove button for all rows except first
            updateRemoveButtons();
        }
        
        function removeItemRow(button) {
            const row = button.closest('tr');
            if (document.querySelectorAll('#order-items tr').length > 1) {
                row.remove();
                calculateTotals();
                updateRemoveButtons();
            }
        }
        
        function updateRemoveButtons() {
            const rows = document.querySelectorAll('#order-items tr');
            rows.forEach((row, index) => {
                const removeBtn = row.querySelector('.remove-btn');
                if (rows.length === 1) {
                    removeBtn.disabled = true;
                    removeBtn.style.opacity = '0.5';
                    removeBtn.style.cursor = 'not-allowed';
                } else {
                    removeBtn.disabled = false;
                    removeBtn.style.opacity = '1';
                    removeBtn.style.cursor = 'pointer';
                }
            });
        }
        
        function updateItemPrice(select) {
            const row = select.closest('tr');
            const priceInput = row.querySelector('.item-price');
            const mocktailName = select.value;
            
            if (mocktailName === 'custom') {
                priceInput.readOnly = false;
                priceInput.placeholder = 'Enter price';
                priceInput.value = '';
            } else if (mocktailName && mocktailPrices[mocktailName] !== undefined) {
                priceInput.readOnly = true;
                priceInput.value = mocktailPrices[mocktailName].toFixed(2);
            } else {
                priceInput.readOnly = true;
                priceInput.value = '';
            }
            
            calculateTotals();
        }
        
        // ===== CALCULATIONS =====
        function calculateTotals() {
            let subtotal = 0;
            
            document.querySelectorAll('#order-items tr').forEach(row => {
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const total = qty * price;
                
                // Update row total
                row.querySelector('.item-total').textContent = `N${total.toFixed(2)}`;
                subtotal += total;
            });
            
            const total = subtotal + deliveryFee;
            
            // Update display
            document.getElementById('subtotal').textContent = `N${subtotal.toFixed(2)}`;
            document.getElementById('delivery-fee').textContent = `N${deliveryFee.toFixed(2)}`;
            document.getElementById('total-amount').textContent = `N${total.toFixed(2)}`;
            
            return { subtotal, deliveryFee, total };
        }
        
        // ===== ORDER SUBMISSION =====
        function submitOrder() {
            // Validate step 4
            const paymentMethod = document.getElementById('payment-method').value;
            const signature = document.getElementById('signature').value.trim();
            
            if (!paymentMethod) {
                showError('payment-error', 'Please select a payment method');
                return;
            }
            
            if (!signature) {
                showError('signature-error', 'Please type your name to confirm the order');
                return;
            }
            
            // Generate order ID
            generatedOrderId = generateOrderId();
            
            // Prepare form data for Microsoft Forms
            const formData = prepareFormData();
            
            // Display success screen
            showSuccessScreen(formData);
        }
        
        function generateOrderId() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const random = Math.floor(1000 + Math.random() * 9000);
            return `AB-${year}${month}${day}-${random}`;
        }
        
        function prepareFormData() {
            const totals = calculateTotals();
            
            // Format items for display
            let itemsText = '';
            document.querySelectorAll('#order-items tr').forEach((row, index) => {
                const name = row.querySelector('.item-name').value;
                const qty = row.querySelector('.item-qty').value;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                
                if (name && qty && price > 0) {
                    itemsText += `${qty}x ${name} @ N${price.toFixed(2)} each = N${(qty * price).toFixed(2)}\n`;
                }
            });
            
            // Format dates
            const formatDate = (dateStr) => {
                if (!dateStr) return 'Not specified';
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };
            
            // Create the data object
            return {
                orderId: generatedOrderId,
                timestamp: new Date().toLocaleString('en-GB'),
                customerName: document.getElementById('full-name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                instagram: document.getElementById('instagram').value.trim(),
                eventType: document.getElementById('event-type').value || 'Not specified',
                eventDate: formatDate(document.getElementById('event-date').value),
                deliveryAddress: document.getElementById('delivery-address').value.trim(),
                deliveryDate: formatDate(document.getElementById('delivery-date').value),
                deliveryTime: document.getElementById('delivery-time').value.trim(),
                specialRequests: document.getElementById('special-requests').value.trim() || 'None',
                items: itemsText,
                subtotal: totals.subtotal.toFixed(2),
                deliveryFee: totals.deliveryFee.toFixed(2),
                totalAmount: totals.total.toFixed(2),
                paymentMethod: document.getElementById('payment-method').value,
                signature: document.getElementById('signature').value.trim()
            };
        }
        
        function showSuccessScreen(formData) {
            // Hide all form sections
            document.querySelectorAll('.form-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show success screen
            const successScreen = document.getElementById('success-screen');
            successScreen.style.display = 'block';
            
            // Display order ID
            document.getElementById('order-id-display').textContent = generatedOrderId;
            
            // Format data for display
            const displayData = `
=== ORDER SUMMARY ===
Order ID: ${formData.orderId}
Order Date: ${formData.timestamp}

=== CUSTOMER INFORMATION ===
Full Name: ${formData.customerName}
Phone Number: ${formData.phone}
Email: ${formData.email || 'Not provided'}
Instagram: ${formData.instagram || 'Not provided'}

=== EVENT DETAILS ===
Event Type: ${formData.eventType}
Event Date: ${formData.eventDate}

=== DELIVERY INFORMATION ===
Delivery Address:
${formData.deliveryAddress}

Delivery Date: ${formData.deliveryDate}
Delivery Time: ${formData.deliveryTime}

Special Requests: ${formData.specialRequests}

=== ORDER ITEMS ===
${formData.items}

=== PAYMENT SUMMARY ===
Subtotal: N${formData.subtotal}
Delivery Fee: N${formData.deliveryFee}
Total Amount: N${formData.totalAmount}

Payment Method: ${formData.paymentMethod}

=== CONFIRMATION ===
Customer Signature: ${formData.signature}
Order Confirmed: ${new Date().toLocaleDateString('en-GB')}
            `;
            
            document.getElementById('form-data-output').textContent = displayData;
            
            // Save to localStorage as backup
            saveOrderToLocalStorage(formData);
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
        
        // ===== COPY TO CLIPBOARD =====
        function copyFormData() {
            const formData = document.getElementById('form-data-output').textContent;
            
            navigator.clipboard.writeText(formData).then(() => {
                alert('✅ Form data copied to clipboard!\n\nNow open the Microsoft Form and paste each piece into the correct field.');
            }).catch(err => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = formData;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('✅ Form data copied to clipboard!\n\nNow open the Microsoft Form and paste each piece into the correct field.');
            });
        }
        
        function openMicrosoftForm() {
            if (MICROSOFT_FORMS_LINK.includes('YOUR_FORM_ID')) {
                alert('⚠️ Please update the Microsoft Forms link first!\n\n1. Open the HTML file in a text editor\n2. Find: const MICROSOFT_FORMS_LINK = "..."\n3. Replace with your actual Microsoft Forms link\n4. Save and refresh the page');
                return;
            }
            window.open(MICROSOFT_FORMS_LINK, '_blank');
        }
        
        // ===== LOCAL STORAGE =====
        function saveOrderToLocalStorage(orderData) {
            const orders = JSON.parse(localStorage.getItem('mocktails_orders') || '[]');
            orders.push({
                ...orderData,
                savedAt: new Date().toISOString()
            });
            localStorage.setItem('mocktails_orders', JSON.stringify(orders));
        }
        
        // ===== NEW ORDER =====
        function startNewOrder() {
            // Reset form
            document.getElementById('full-name').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('email').value = '';
            document.getElementById('instagram').value = '';
            document.getElementById('event-type').value = '';
            document.getElementById('event-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('delivery-date').value = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            document.getElementById('delivery-time').value = '2:00 PM';
            document.getElementById('delivery-address').value = '';
            document.getElementById('special-requests').value = '';
            document.getElementById('payment-method').value = '';
            document.getElementById('signature').value = '';
            
            // Reset order items (keep one row)
            const tbody = document.getElementById('order-items');
            while (tbody.children.length > 1) {
                tbody.removeChild(tbody.lastChild);
            }
            
            // Reset first row
            const firstRow = tbody.children[0];
            firstRow.querySelector('.item-name').value = '';
            firstRow.querySelector('.item-qty').value = 1;
            firstRow.querySelector('.item-price').value = '';
            firstRow.querySelector('.item-total').textContent = 'N0.00';
            
            // Reset totals
            calculateTotals();
            updateRemoveButtons();
            
            // Hide success screen, show first step
            document.getElementById('success-screen').style.display = 'none';
            showStep(1);
            
            // Reset steps in sidebar
            document.querySelectorAll('.step').forEach(stepEl => {
                stepEl.classList.remove('completed');
            });
            document.querySelector('.step[data-step="1"]').classList.add('active');
        }
        
        // Initialize remove buttons
        updateRemoveButtons();
    </script>