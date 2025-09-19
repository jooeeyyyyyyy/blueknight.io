/* * BlueKnight M&A Platform Redesign  
 * app.js 
 * * ES Module for all site interactions
 */

document.addEventListener('DOMContentLoaded', () => {

    const initHeader = () => {
        const header = document.querySelector('.site-header');
        const navLinks = document.querySelectorAll('.main-nav a'); // Desktop links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-panel a');
        const sections = document.querySelectorAll('main section');

        // Sticky header
        const handleScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        };

        // Active link highlighting on scroll
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    const allLinks = [...navLinks, ...mobileNavLinks];
                    allLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' });

        sections.forEach(section => sectionObserver.observe(section));
        window.addEventListener('scroll', handleScroll);
    };

    const initMobileNav = () => {
        const navToggle = document.querySelector('.header-mobile .nav-toggle');
        const mobileNavPanel = document.getElementById('mobile-nav-panel');

        if (!navToggle || !mobileNavPanel) return;

        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            mobileNavPanel.classList.toggle('is-open');
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        mobileNavPanel.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navToggle.setAttribute('aria-expanded', 'false');
                mobileNavPanel.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        });
    };

    const initThemeToggle = () => {
        const themeToggles = document.querySelectorAll('.theme-toggle');
        const htmlEl = document.documentElement;

        const applyTheme = (theme) => {
            htmlEl.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        };
        
        const storedTheme = localStorage.getItem('theme');
        const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const currentTheme = storedTheme || preferredTheme;

        applyTheme(currentTheme);

        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const newTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(newTheme);
            });
        });
    };

    const initScrollAnimations = () => {
        const animatedSections = document.querySelectorAll('main section');
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedSections.forEach(section => observer.observe(section));
    };
    
    const initPlatformTabs = () => {
        const tabComponents = document.querySelectorAll('.tabs-component');
        if (tabComponents.length === 0) return;

        tabComponents.forEach(component => {
            const tabList = component.querySelector('[role="tablist"]');
            const tabs = Array.from(component.querySelectorAll('[role="tab"]'));
            const panels = Array.from(component.querySelectorAll('[role="tabpanel"]'));
            const prevButton = component.querySelector('.tabs-nav-button.prev');
            const nextButton = component.querySelector('.tabs-nav-button.next');
            const sliderPrevButton = component.querySelector('.slider-button.prev');
            const sliderNextButton = component.querySelector('.slider-button.next');
            const paginationContainer = component.querySelector('.slider-pagination');
            let paginationDots = [];

            if (!tabList || tabs.length === 0) return;

            // Create pagination dots
            if (paginationContainer) {
                tabs.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.classList.add('pagination-dot');
                    dot.setAttribute('aria-label', `Go to feature ${index + 1}`);
                    dot.addEventListener('click', () => {
                        const targetTab = tabs[index];
                        const currentTab = tabList.querySelector('[aria-selected="true"]');
                        if (targetTab !== currentTab) {
                            switchTab(currentTab, targetTab);
                        }
                    });
                    paginationContainer.appendChild(dot);
                    paginationDots.push(dot);
                });
            }

            const updatePagination = () => {
                const currentIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
                paginationDots.forEach((dot, index) => {
                    dot.classList.toggle('is-active', index === currentIndex);
                });
                
                if (sliderPrevButton && sliderNextButton) {
                    sliderPrevButton.disabled = currentIndex === 0;
                    sliderNextButton.disabled = currentIndex === tabs.length - 1;
                }
            };

            const switchTab = (oldTab, newTab) => {
                newTab.focus();
                newTab.removeAttribute('tabindex');
                newTab.setAttribute('aria-selected', 'true');
                oldTab.removeAttribute('aria-selected');
                oldTab.setAttribute('tabindex', '-1');
                
                const oldPanelId = oldTab.getAttribute('aria-controls');
                const newPanelId = newTab.getAttribute('aria-controls');
                const oldPanel = component.querySelector(`#${oldPanelId}`);
                const newPanel = component.querySelector(`#${newPanelId}`);

                if (oldPanel && newPanel) {
                    // Pause video in old panel (but only if it's not the modal video)
                    const oldVideo = oldPanel.querySelector('video');
                    if (oldVideo && oldVideo.id !== 'modal-video' && !oldVideo.dataset.isModalVideo) {
                        oldVideo.pause();
                    }
                    
                    oldPanel.hidden = true;
                    newPanel.hidden = false;
                    
                    // Play video in new panel (but only if it's not the modal video)
                    const newVideo = newPanel.querySelector('video');
                    if (newVideo && newVideo.id !== 'modal-video' && !newVideo.dataset.isModalVideo) {
                        newVideo.currentTime = 0; // Reset to beginning
                        // Enhanced play with better error handling
                        const playPromise = newVideo.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(e => {
                                console.log('Video autoplay prevented:', e);
                                // Ensure muted for autoplay compatibility
                                newVideo.muted = true;
                                newVideo.play().catch(err => console.log('Video play failed:', err));
                            });
                        }
                    }
                }

                newTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                updatePagination();
            };

            tabList.addEventListener('click', e => {
                const clickedTab = e.target.closest('[role="tab"]');
                if (!clickedTab) return;

                const currentTab = tabList.querySelector('[aria-selected="true"]');
                if (clickedTab !== currentTab) {
                    switchTab(currentTab, clickedTab);
                }
            });

            tabList.addEventListener('keydown', e => {
                const currentIndex = tabs.findIndex(tab => tab === e.target);
                let targetIndex;

                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    targetIndex = (currentIndex + 1) % tabs.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                }

                if (targetIndex !== undefined) {
                    switchTab(tabs[currentIndex], tabs[targetIndex]);
                }
            });

            const updateNavButtonsState = () => {
                if (!prevButton || !nextButton) return;
                const scrollEnd = Math.ceil(tabList.scrollWidth - tabList.scrollLeft) <= tabList.clientWidth + 1;
                
                prevButton.disabled = tabList.scrollLeft <= 0;
                nextButton.disabled = scrollEnd;
            };

            if (prevButton && nextButton) {
                prevButton.addEventListener('click', () => {
                    tabList.scrollLeft -= tabList.clientWidth * 0.75;
                });
                nextButton.addEventListener('click', () => {
                    tabList.scrollLeft += tabList.clientWidth * 0.75;
                });

                tabList.addEventListener('scroll', updateNavButtonsState, { passive: true });
                const resizeObserver = new ResizeObserver(() => updateNavButtonsState());
                resizeObserver.observe(tabList);
            }

            // Add slider button functionality
            if (sliderPrevButton && sliderNextButton) {
                sliderPrevButton.addEventListener('click', () => {
                    const currentIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
                    if (currentIndex > 0) {
                        switchTab(tabs[currentIndex], tabs[currentIndex - 1]);
                    }
                });

                sliderNextButton.addEventListener('click', () => {
                    const currentIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
                    if (currentIndex < tabs.length - 1) {
                        switchTab(tabs[currentIndex], tabs[currentIndex + 1]);
                    }
                });
            }
            
            // Initialize pagination and first video
            updatePagination();
            const firstPanel = component.querySelector('[role="tabpanel"]:not([hidden])');
            if (firstPanel) {
                const firstVideo = firstPanel.querySelector('video');
                if (firstVideo) {
                    // Enhanced play with better error handling
                    const playPromise = firstVideo.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => {
                            console.log('Video autoplay prevented:', e);
                            // Ensure muted for autoplay compatibility
                            firstVideo.muted = true;
                            firstVideo.play().catch(err => console.log('Video play failed:', err));
                        });
                    }
                }
            }
        });
    };

    const initProductShowcase = () => {
        const section = document.getElementById('product-showcase');
        if (!section) return;
    
        const component = section.querySelector('.showcase-tabs-component');
        if (!component) return;

        const panels = Array.from(component.querySelectorAll('[role="tabpanel"]'));
        const prevButton = component.querySelector('.slider-button.prev');
        const nextButton = component.querySelector('.slider-button.next');
        const paginationContainer = component.querySelector('.slider-pagination');
        let paginationDots = [];
        let currentIndex = 0;

        if (panels.length === 0) return;

        // Create pagination dots
        if (paginationContainer) {
            panels.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('pagination-dot');
                dot.setAttribute('aria-label', `Go to feature ${index + 1}`);
                dot.addEventListener('click', () => {
                    switchPanel(currentIndex, index);
                });
                paginationContainer.appendChild(dot);
                paginationDots.push(dot);
            });
        }

        const updatePagination = () => {
            paginationDots.forEach((dot, index) => {
                dot.classList.toggle('is-active', index === currentIndex);
            });
            
            if (prevButton && nextButton) {
                prevButton.disabled = currentIndex === 0;
                nextButton.disabled = currentIndex === panels.length - 1;
            }
        };

        const switchPanel = (oldIndex, newIndex) => {
            if (oldIndex === newIndex) return;

            const oldPanel = panels[oldIndex];
            const newPanel = panels[newIndex];

            if (oldPanel && newPanel) {
                // Pause video in old panel (but only if it's not the modal video)
                const oldVideo = oldPanel.querySelector('video');
                if (oldVideo && oldVideo.id !== 'modal-video' && !oldVideo.dataset.isModalVideo) {
                    oldVideo.pause();
                }
                
                oldPanel.hidden = true;
                newPanel.hidden = false;
                newPanel.focus();
                
                // Play video in new panel (but only if it's not the modal video)
                const newVideo = newPanel.querySelector('video');
                if (newVideo && newVideo.id !== 'modal-video' && !newVideo.dataset.isModalVideo) {
                    newVideo.currentTime = 0; // Reset to beginning
                    // Enhanced play with better error handling
                    const playPromise = newVideo.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => {
                            console.log('Video autoplay prevented:', e);
                            // Ensure muted for autoplay compatibility
                            newVideo.muted = true;
                            newVideo.play().catch(err => console.log('Video play failed:', err));
                        });
                    }
                }
            }

            currentIndex = newIndex;
            updatePagination();
        };

        // Add slider button functionality
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    switchPanel(currentIndex, currentIndex - 1);
                }
            });

            nextButton.addEventListener('click', () => {
                if (currentIndex < panels.length - 1) {
                    switchPanel(currentIndex, currentIndex + 1);
                }
            });
        }
        
        // Initialize pagination and first video
        updatePagination();
        const firstPanel = panels[0];
        if (firstPanel) {
            const firstVideo = firstPanel.querySelector('video');
            if (firstVideo) {
                // Enhanced play with better error handling
                const playPromise = firstVideo.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.log('Video autoplay prevented:', e);
                        // Ensure muted for autoplay compatibility
                        firstVideo.muted = true;
                        firstVideo.play().catch(err => console.log('Video play failed:', err));
                    });
                }
            }
        }
    };

    const initWalkthroughSlider = () => {
        const section = document.getElementById('walkthrough');
        if (!section) return;

        const sliderWrapper = section.querySelector('.walkthrough-slider-wrapper');
        const slider = sliderWrapper.querySelector('.walkthrough-slider');
        const slides = Array.from(slider.querySelectorAll('.walkthrough-step'));
        const prevButton = sliderWrapper.querySelector('.slider-button.prev');
        const nextButton = sliderWrapper.querySelector('.slider-button.next');
        const paginationContainer = sliderWrapper.querySelector('.slider-pagination');
        let paginationDots = [];

        // 1. Pagination
        if (paginationContainer) {
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('pagination-dot');
                dot.setAttribute('aria-label', `Go to step ${index + 1}`);
                dot.addEventListener('click', () => {
                    const targetSlide = slides[index];
                    const targetScrollLeft = targetSlide.offsetLeft - slider.offsetLeft;
                    slider.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
                });
                paginationContainer.appendChild(dot);
                paginationDots.push(dot);
            });
        }
        
        const updatePagination = () => {
            if (paginationDots.length === 0) return;
            let closestSlideIndex = 0;
            let minDistance = Infinity;
            const scrollLeft = slider.scrollLeft;
            const containerWidth = slider.clientWidth;
            
            // Handle edge cases first
            if (scrollLeft <= 10) {
                closestSlideIndex = 0;
            } else if (scrollLeft >= slider.scrollWidth - containerWidth - 10) {
                closestSlideIndex = slides.length - 1;
            } else {
                // For middle positions, find the slide that's most visible
                const scrollCenter = scrollLeft + containerWidth / 2;
                slides.forEach((slide, index) => {
                    const slideLeft = slide.offsetLeft;
                    const slideRight = slideLeft + slide.offsetWidth;
                    const slideCenter = slideLeft + slide.offsetWidth / 2;
                    
                    // Check if slide is at least partially visible
                    const isVisible = slideRight > scrollLeft && slideLeft < scrollLeft + containerWidth;
                    
                    if (isVisible) {
                        const distance = Math.abs(slideCenter - scrollCenter);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestSlideIndex = index;
                        }
                    }
                });
            }
            
            paginationDots.forEach((dot, index) => dot.classList.toggle('is-active', index === closestSlideIndex));
        };
        
        // 2. Button State & Scroll Logic
        const updateButtons = () => {
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            prevButton.disabled = slider.scrollLeft < 10;
            nextButton.disabled = slider.scrollLeft > maxScroll - 10;
        };

        const getScrollAmount = () => {
            const slide = slider.querySelector('.walkthrough-step');
            if (!slide) return 0;
            const style = window.getComputedStyle(slide.parentElement);
            const gap = parseFloat(style.gap) || 24;
            return slide.offsetWidth + gap;
        };

        prevButton.addEventListener('click', () => slider.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' }));
        nextButton.addEventListener('click', () => slider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' }));
        
        // 3. Drag-to-swipe
        let isDown = false, startX, scrollLeft;
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('is-dragging');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        ['mouseleave', 'mouseup'].forEach(event => slider.addEventListener(event, () => {
            isDown = false;
            slider.classList.remove('is-dragging');
        }));
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });

        // 4. Observers and Initial Calls
        slider.addEventListener('scroll', () => {
            updateButtons();
            updatePagination();
        }, { passive: true });
        new ResizeObserver(() => {
            updateButtons();
            updatePagination();
        }).observe(slider);

        updateButtons();
        updatePagination();
    };

    const initFaqAccordion = () => {
        const accordion = document.querySelector('.faq-accordion');
        if (!accordion) return;

        accordion.addEventListener('click', (e) => {
            const question = e.target.closest('.faq-question');
            if (!question) return;
            
            const item = question.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const isExpanded = question.getAttribute('aria-expanded') === 'true';

            accordion.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    otherItem.querySelector('.faq-answer').setAttribute('hidden', '');
                }
            });

            question.setAttribute('aria-expanded', !isExpanded);
            answer.hidden = isExpanded;
        });

        accordion.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            if (!activeEl.classList.contains('faq-question')) return;
            
            const items = Array.from(accordion.querySelectorAll('.faq-item'));
            const currentIndex = items.findIndex(item => item.contains(activeEl));

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex].querySelector('.faq-question').focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + items.length) % items.length;
                items[prevIndex].querySelector('.faq-question').focus();
            }
        });
    };

    const initContactForm = () => {
        const form = document.getElementById('contact-form');
        const statusEl = document.getElementById('form-status');
        if (!form) return;

        const validateField = (field) => {
            const parent = field.closest('.form-group');
            const errorEl = parent.querySelector('.error-message');
            let isValid = true;
            let errorMessage = '';

            if (field.hasAttribute('required') && !field.value.trim()) {
                isValid = false;
                errorMessage = 'This field is required.';
            } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }

            parent.classList.toggle('has-error', !isValid);
            if (errorEl) errorEl.textContent = errorMessage;
            return isValid;
        };
        
        form.addEventListener('input', e => {
            if (e.target.hasAttribute('required')) {
                validateField(e.target);
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fields = form.querySelectorAll('input[required], textarea[required]');
            const isFormValid = Array.from(fields).every(field => validateField(field));

            if (!isFormValid) {
                statusEl.textContent = 'Please correct the errors above.';
                statusEl.className = 'error';
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            statusEl.textContent = '';
            statusEl.className = '';

            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                statusEl.textContent = "Thank you! We'll be in touch shortly.";
                statusEl.className = 'success';
                form.reset();
            } catch (error) {
                console.error('Form submission error:', error);
                statusEl.textContent = 'An error occurred. Please try again later.';
                statusEl.className = 'error';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Schedule a Demo';
            }
        });
    };

    const initVideoSystem = () => {
        const modal = document.getElementById('video-modal');
        const modalVideo = document.getElementById('modal-video');
        const closeButton = modal.querySelector('.video-modal-close');
        
        if (!modal || !modalVideo || !closeButton) return;

        // Helper function to detect mobile devices
        const isMobileDevice = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
        };

        // Enhanced video loading with better error handling
        const loadVideo = (video, src, isModal = false) => {
            return new Promise((resolve, reject) => {
                const handleLoad = () => {
                    video.removeEventListener('loadeddata', handleLoad);
                    video.removeEventListener('error', handleError);
                    resolve(video);
                };

                const handleError = (e) => {
                    video.removeEventListener('loadeddata', handleLoad);
                    video.removeEventListener('error', handleError);
                    console.warn('Video loading failed:', src, e);
                    reject(e);
                };

                video.addEventListener('loadeddata', handleLoad);
                video.addEventListener('error', handleError);

                // Set video attributes based on context
                if (isModal) {
                    // For modal: enable controls, disable autoplay/loop, enable sound
                    video.setAttribute('controls', 'true');
                    video.setAttribute('preload', 'metadata');
                    video.setAttribute('playsinline', 'true');
                    video.removeAttribute('autoplay');
                    video.removeAttribute('loop');
                    video.muted = false; // Enable sound in modal
                    video.loop = false; // Explicitly disable loop
                } else {
                    // For inline videos: keep original behavior
                    video.setAttribute('preload', 'metadata');
                    video.setAttribute('playsinline', 'true');
                    video.muted = true; // Ensure muted for autoplay compatibility
                }
                
                video.src = src;
                video.load(); // Force reload
            });
        };

        // Enhanced play function with better browser support
        const playVideo = async (video, isModal = false) => {
            try {
                // Ensure video is ready
                if (video.readyState < 2) {
                    await new Promise(resolve => {
                        const checkReady = () => {
                            if (video.readyState >= 2) {
                                resolve();
                            } else {
                                setTimeout(checkReady, 50);
                            }
                        };
                        checkReady();
                    });
                }

                // Reset video position
                video.currentTime = 0;

                // For modal videos with controls, don't auto-start - let user control playback
                if (isModal && video.controls) {
                    // Just prepare the video, let user control playback via controls
                    return Promise.resolve();
                }

                // Play with promise handling (for inline videos or non-control modals)
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    return playPromise.catch(error => {
                        console.warn('Video autoplay prevented:', error);
                        // For non-modal videos, try to play without sound as fallback
                        if (!isModal) {
                            video.muted = true;
                            return video.play();
                        }
                        return Promise.resolve();
                    });
                }
                return Promise.resolve();
            } catch (error) {
                console.warn('Video play error:', error);
                return Promise.reject(error);
            }
        };

        // Helper function to prepare video for fullscreen with native controls
        const prepareVideoForFullscreen = (video) => {
            // Store original attributes
            video.dataset.originalLoop = video.loop;
            video.dataset.originalMuted = video.muted;
            video.dataset.originalControls = video.controls;
            video.dataset.originalAutoplay = video.autoplay;
            
            // Modify video for fullscreen/native controls
            video.loop = false;
            video.muted = false;
            video.controls = true;
            video.autoplay = false;
            video.setAttribute('controls', 'true');
            video.removeAttribute('loop');
            video.removeAttribute('autoplay');
        };

        // Helper function to restore video to original state
        const restoreVideoAttributes = (video) => {
            if (video.dataset.originalLoop !== undefined) {
                video.loop = video.dataset.originalLoop === 'true';
                if (video.loop) {
                    video.setAttribute('loop', 'true');
                } else {
                    video.removeAttribute('loop');
                }
                delete video.dataset.originalLoop;
            }
            if (video.dataset.originalMuted !== undefined) {
                video.muted = video.dataset.originalMuted === 'true';
                delete video.dataset.originalMuted;
            }
            if (video.dataset.originalControls !== undefined) {
                const shouldHaveControls = video.dataset.originalControls === 'true';
                video.controls = shouldHaveControls;
                if (!shouldHaveControls) {
                    video.removeAttribute('controls');
                } else {
                    video.setAttribute('controls', 'true');
                }
                delete video.dataset.originalControls;
            }
            if (video.dataset.originalAutoplay !== undefined) {
                const shouldAutoplay = video.dataset.originalAutoplay === 'true';
                video.autoplay = shouldAutoplay;
                if (shouldAutoplay) {
                    video.setAttribute('autoplay', 'true');
                } else {
                    video.removeAttribute('autoplay');
                }
                delete video.dataset.originalAutoplay;
            }
        };

        // Helper function to enter fullscreen on mobile
        const enterFullscreen = (video) => {
            try {
                if (video.requestFullscreen) {
                    return video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                    return video.webkitRequestFullscreen();
                } else if (video.mozRequestFullScreen) {
                    return video.mozRequestFullScreen();
                } else if (video.msRequestFullscreen) {
                    return video.msRequestFullscreen();
                } else if (video.webkitEnterFullscreen) {
                    // iOS Safari fallback
                    return video.webkitEnterFullscreen();
                }
            } catch (error) {
                console.warn('Fullscreen request failed:', error);
            }
            return Promise.resolve();
        };

        const openModal = async (videoSrc) => {
            try {
                // Load video with modal-specific settings
                await loadVideo(modalVideo, videoSrc, true);
                
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                
                // Focus the close button for accessibility
                setTimeout(() => closeButton.focus(), 100);
                
                // Add a flag to prevent other systems from pausing this video
                modalVideo.dataset.isModalVideo = 'true';
                
                // Play the video (will respect controls and not auto-start)
                await playVideo(modalVideo, true);
            } catch (error) {
                console.error('Failed to open video modal:', error);
                // Fallback: still show modal even if video fails
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                
                // Still set the flag even on error
                modalVideo.dataset.isModalVideo = 'true';
            }
        };

        const closeModal = () => {
            try {
                modalVideo.pause();
                modalVideo.src = '';
                modalVideo.load(); // Clear the video
                // Remove the modal flag
                delete modalVideo.dataset.isModalVideo;
            } catch (error) {
                console.warn('Error closing video:', error);
            }
            
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        // Initialize all videos on page load for better performance
        const initializeVideos = () => {
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                // Set optimal attributes for cross-browser compatibility
                video.setAttribute('preload', 'metadata');
                video.setAttribute('playsinline', 'true');
                video.muted = true;
                
                // Add error handling
                video.addEventListener('error', (e) => {
                    console.warn('Video error:', video.currentSrc || 'unknown source', e);
                    // Hide video container if it fails to load
                    const wrapper = video.closest('.panel-image-wrapper, .showcase-video-wrapper');
                    if (wrapper) {
                        wrapper.style.opacity = '0.5';
                        wrapper.setAttribute('title', 'Video unavailable');
                    }
                });

                // Improve loading performance
                video.addEventListener('loadstart', () => {
                    const wrapper = video.closest('.panel-image-wrapper, .showcase-video-wrapper');
                    if (wrapper) {
                        wrapper.classList.add('loading');
                    }
                });

                video.addEventListener('loadeddata', () => {
                    const wrapper = video.closest('.panel-image-wrapper, .showcase-video-wrapper');
                    if (wrapper) {
                        wrapper.classList.remove('loading');
                    }
                });

                // Handle video source loading for better compatibility
                video.addEventListener('loadedmetadata', () => {
                    // Video metadata loaded successfully
                    const wrapper = video.closest('.panel-image-wrapper, .showcase-video-wrapper');
                    if (wrapper) {
                        wrapper.classList.remove('loading');
                    }
                });
            });
        };

        // Close button event
        closeButton.addEventListener('click', closeModal);

        // Close on backdrop click (but not on video click)
        modal.addEventListener('click', (e) => {
            // Only close if clicking on the modal backdrop, not on the video or modal content
            if (e.target === modal) {
                closeModal();
            }
        });

        // Prevent modal from closing when clicking on video or modal content
        const modalContent = modal.querySelector('.video-modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });

        // Enhanced video click handling
        document.addEventListener('click', async (e) => {
            const video = e.target.closest('video');
            if (video && (video.src || video.currentSrc || video.querySelector('source'))) {
                e.preventDefault();
                
                // Get video source (prioritize currentSrc, then src, then first source element)
                const videoSrc = video.currentSrc || video.src || 
                    (video.querySelector('source') && video.querySelector('source').src);
                
                if (!videoSrc) {
                    console.warn('No video source found');
                    return;
                }
                
                // Check if it's a mobile device
                if (isMobileDevice()) {
                    try {
                        // On mobile: prepare video for fullscreen with native controls
                        prepareVideoForFullscreen(video);
                        
                        await playVideo(video);
                        
                        // Enter fullscreen after video starts playing
                        setTimeout(async () => {
                            try {
                                await enterFullscreen(video);
                            } catch (error) {
                                console.warn('Fullscreen failed, continuing with inline playback');
                                // Restore original attributes if fullscreen fails
                                restoreVideoAttributes(video);
                            }
                        }, 200);
                    } catch (error) {
                        console.warn('Mobile video playback failed:', error);
                        // Restore original attributes on error
                        restoreVideoAttributes(video);
                        // Fallback to modal even on mobile if direct playback fails
                        openModal(videoSrc);
                    }
                } else {
                    // On desktop: open modal
                    openModal(videoSrc);
                }
            }
        });

        // Handle fullscreen exit events
        const handleFullscreenExit = () => {
            const isInFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );

            if (!isInFullscreen) {
                // Fullscreen exited, find and handle any playing videos (except modal video)
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                    // Only pause if it's NOT the modal video and was modified for fullscreen
                    if (!video.paused && video.id !== 'modal-video' && !video.dataset.isModalVideo && video.dataset.originalLoop !== undefined) {
                        video.pause();
                        
                        // Restore original video attributes if they were modified for fullscreen
                        restoreVideoAttributes(video);
                    }
                });
            }
        };

        // Add fullscreen change listeners
        document.addEventListener('fullscreenchange', handleFullscreenExit);
        document.addEventListener('webkitfullscreenchange', handleFullscreenExit);
        document.addEventListener('mozfullscreenchange', handleFullscreenExit);
        document.addEventListener('MSFullscreenChange', handleFullscreenExit);

        // Initialize videos when DOM is ready
        initializeVideos();

        // Handle visibility changes to pause videos when page is hidden (but exclude modal video)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Add a small delay to avoid conflicts with modal opening
                setTimeout(() => {
                    // Double-check that the page is still hidden and modal isn't open
                    if (document.hidden && !modal.classList.contains('is-open')) {
                        const videos = document.querySelectorAll('video');
                        videos.forEach(video => {
                            // Don't pause the modal video - let user control it
                            if (!video.paused && video.id !== 'modal-video' && !video.dataset.isModalVideo) {
                                video.pause();
                            }
                        });
                    }
                }, 100);
            }
        });
    };
    
    // Initialize all modules
    initHeader();
    initMobileNav();
    initThemeToggle();
    initScrollAnimations();
    initPlatformTabs();
    initProductShowcase();
    initWalkthroughSlider();
    initFaqAccordion();
    initContactForm();
    initVideoSystem();
});