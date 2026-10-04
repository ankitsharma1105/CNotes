"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    // Navigation Logic (SPA Routing) using Event Delegation
    document.addEventListener('click', (event) => {
        // Find if the clicked element or any of its parents has the data-navigate attribute
        const navigateElement = event.target.closest('[data-navigate]');

        if (navigateElement) {
            // Prevent default browser behavior if it's an anchor tag to stop it from jumping to the top of the page
            if (navigateElement.tagName.toLowerCase() === 'a') {
                event.preventDefault();
            }

            const sectionId = navigateElement.getAttribute('data-navigate');
            navigateTo(sectionId);
        }
    });

    // Feedback Form Submission
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', submitFeedback);
    }
});

function navigateTo(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update active state in navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Find the relevant nav item based on data-target
    let targetNav = sectionId;
    if (sectionId.startsWith('content-')) {
        targetNav = 'content';
    } else if (sectionId.startsWith('test-')) {
        targetNav = 'tests';
    }

    const activeNavItem = document.querySelector(`.nav-item[data-target="${targetNav}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Close mobile menu if open
    const navLinks = document.getElementById('nav-links');
    if (navLinks && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
    }

    // Scroll smoothly to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function submitFeedback(event) {
    event.preventDefault();

    const form = event.target;
    const successMessage = document.getElementById('success-message');

    // Animate button to show loading state
    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    // Simulate API call for form submission
    setTimeout(() => {
        form.reset();
        btn.innerHTML = originalText;
        btn.disabled = false;

        if (successMessage) {
            successMessage.style.display = 'flex';
            // Hide success message automatically after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }
    }, 1500);
}
