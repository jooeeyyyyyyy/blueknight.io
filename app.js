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
                    // Pause video in old panel (but only if modal is not open)
                    const oldVideo = oldPanel.querySelector('video');
                    if (oldVideo && oldVideo.id !== 'modal-video') {
                        // Check if modal is open by looking for the global modal state
                        const modal = document.getElementById('video-modal');
                        const isModalCurrentlyOpen = modal && modal.classList.contains('is-open');
                        if (!isModalCurrentlyOpen) {
                            oldVideo.pause();
                        }
                    }
                    
                    oldPanel.hidden = true;
                    newPanel.hidden = false;
                    
                    // Play video in new panel (but only if modal is not open)
                    const newVideo = newPanel.querySelector('video');
                    if (newVideo && newVideo.id !== 'modal-video') {
                        const modal = document.getElementById('video-modal');
                        const isModalCurrentlyOpen = modal && modal.classList.contains('is-open');
                        if (!isModalCurrentlyOpen) {
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
                // Pause video in old panel (but only if modal is not open)
                const oldVideo = oldPanel.querySelector('video');
                if (oldVideo && oldVideo.id !== 'modal-video') {
                    const modal = document.getElementById('video-modal');
                    const isModalCurrentlyOpen = modal && modal.classList.contains('is-open');
                    if (!isModalCurrentlyOpen) {
                        oldVideo.pause();
                    }
                }
                
                oldPanel.hidden = true;
                newPanel.hidden = false;
                newPanel.focus();
                
                // Play video in new panel (but only if modal is not open)
                const newVideo = newPanel.querySelector('video');
                if (newVideo && newVideo.id !== 'modal-video') {
                    const modal = document.getElementById('video-modal');
                    const isModalCurrentlyOpen = modal && modal.classList.contains('is-open');
                    if (!isModalCurrentlyOpen) {
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

        // Global state for modal
        let isModalOpen = false;
        let backgroundVideos = [];

        // Show play button overlay when autoplay fails
        const showPlayButtonOverlay = (video) => {
            const videoContainer = video.closest('.video-modal-content');
            if (!videoContainer || videoContainer.querySelector('.play-overlay')) return;

            const overlay = document.createElement('div');
            overlay.className = 'play-overlay';
            overlay.innerHTML = `
                <button class="play-overlay-button" aria-label="Play video">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5,3 19,12 5,21"></polygon>
                    </svg>
                </button>
            `;
            
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                backdrop-filter: blur(2px);
                border-radius: var(--border-radius-xl);
            `;
            
            const button = overlay.querySelector('.play-overlay-button');
            button.style.cssText = `
                background: rgba(255, 255, 255, 0.9);
                border: none;
                border-radius: 50%;
                width: 80px;
                height: 80px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: #000;
            `;
            
            button.addEventListener('click', async () => {
                try {
                    video.muted = false;
                    await video.play();
                    overlay.remove();
                    console.log('Video started via overlay button');
                } catch (error) {
                    console.warn('Manual play failed:', error);
                }
            });
            
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.1)';
                button.style.background = 'rgba(255, 255, 255, 1)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
                button.style.background = 'rgba(255, 255, 255, 0.9)';
            });
            
            videoContainer.appendChild(overlay);
        };

        // Helper function to detect mobile devices
        const isMobileDevice = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
        };

        // Pause all background videos when modal opens
        const pauseAllBackgroundVideos = () => {
            backgroundVideos = [];
            const videos = document.querySelectorAll('video:not(#modal-video)');
            videos.forEach(video => {
                if (!video.paused) {
                    backgroundVideos.push({
                        element: video,
                        wasPlaying: true,
                        currentTime: video.currentTime
                    });
                    video.pause();
                } else {
                    backgroundVideos.push({
                        element: video,
                        wasPlaying: false,
                        currentTime: video.currentTime
                    });
                }
            });
            console.log('Paused', backgroundVideos.filter(v => v.wasPlaying).length, 'background videos');
        };

        // Resume background videos when modal closes (only if they were playing)
        const resumeBackgroundVideos = () => {
            backgroundVideos.forEach(videoData => {
                const video = videoData.element;
                if (videoData.wasPlaying && video && !video.paused === false) {
                    try {
                        video.currentTime = videoData.currentTime;
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(e => {
                                console.log('Background video resume failed:', e);
                            });
                        }
                    } catch (error) {
                        console.log('Error resuming background video:', error);
                    }
                }
            });
            backgroundVideos = [];
            console.log('Attempted to resume background videos');
        };

        // Enhanced video loading with better error handling
        const loadVideo = (video, src) => {
            return new Promise((resolve, reject) => {
                const handleLoad = () => {
                    video.removeEventListener('loadeddata', handleLoad);
                    video.removeEventListener('error', handleError);
                    video.removeEventListener('canplaythrough', handleCanPlay);
                    resolve(video);
                };

                const handleCanPlay = () => {
                    video.removeEventListener('loadeddata', handleLoad);
                    video.removeEventListener('error', handleError);
                    video.removeEventListener('canplaythrough', handleCanPlay);
                    resolve(video);
                };

                const handleError = (e) => {
                    video.removeEventListener('loadeddata', handleLoad);
                    video.removeEventListener('error', handleError);
                    video.removeEventListener('canplaythrough', handleCanPlay);
                    console.warn('Video loading failed:', src, e);
                    reject(e);
                };

                video.addEventListener('loadeddata', handleLoad);
                video.addEventListener('canplaythrough', handleCanPlay);
                video.addEventListener('error', handleError);

                // Configure modal video for optimal playback with autoplay support
                video.setAttribute('controls', 'true');
                video.setAttribute('preload', 'auto');
                video.setAttribute('playsinline', 'true');
                video.removeAttribute('autoplay'); // We'll handle autoplay programmatically
                video.removeAttribute('loop');
                
                // Start muted for better autoplay compatibility, we'll unmute after play starts
                video.muted = true;
                video.loop = false;
                video.autoplay = false;
                
                video.src = src;
                video.load();
            });
        };

        // Robust modal video play function with autoplay
        const playModalVideo = async (video) => {
            try {
                // Wait for video to be ready
                if (video.readyState < 3) {
                    await new Promise((resolve) => {
                        const checkReady = () => {
                            if (video.readyState >= 3) {
                                resolve();
                            } else {
                                setTimeout(checkReady, 100);
                            }
                        };
                        checkReady();
                    });
                }

                // Reset to beginning
                video.currentTime = 0;

                // Auto-play the modal video (start muted, then try to unmute)
                console.log('Starting modal video autoplay');
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    return playPromise.then(() => {
                        console.log('Modal video started playing');
                        // Try to unmute after successful play start
                        setTimeout(() => {
                            try {
                                video.muted = false;
                                console.log('Modal video unmuted successfully');
                            } catch (error) {
                                console.warn('Could not unmute video:', error);
                            }
                        }, 500); // Small delay to ensure playback is stable
                        return Promise.resolve();
                    }).catch(error => {
                        console.warn('Modal video autoplay failed:', error);
                        // If muted autoplay fails, try without sound
                        video.muted = true;
                        return video.play().then(() => {
                            console.log('Modal video playing muted (user can unmute via controls)');
                            return Promise.resolve();
                        }).catch(err => {
                            console.warn('All autoplay attempts failed:', err);
                            console.log('User can manually start playback via controls');
                            // Show a subtle play button overlay if autoplay completely fails
                            showPlayButtonOverlay(video);
                            return Promise.resolve();
                        });
                    });
                }
                return Promise.resolve();
            } catch (error) {
                console.warn('Modal video setup error:', error);
                return Promise.resolve();
            }
        };

        const openModal = async (videoSrc, userInitiated = true) => {
            try {
                console.log('Opening modal with video:', videoSrc, userInitiated ? '(user initiated)' : '(programmatic)');
                
                // First, pause all background videos
                pauseAllBackgroundVideos();
                
                // Set modal state
                isModalOpen = true;
                modalVideo.dataset.isModalVideo = 'true';
                modalVideo.dataset.userInitiated = userInitiated ? 'true' : 'false';
                
                // Show modal
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                
                // Load and prepare video
                await loadVideo(modalVideo, videoSrc);
                
                // Setup modal video for playback (autoplay more likely to work with user interaction)
                await playModalVideo(modalVideo);
                
                // Focus close button for accessibility
                setTimeout(() => {
                    if (closeButton) closeButton.focus();
                }, 200);
                
                console.log('Modal opened successfully');
                
            } catch (error) {
                console.error('Failed to open video modal:', error);
                // Still show modal even if video fails
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                modalVideo.dataset.isModalVideo = 'true';
                modalVideo.dataset.userInitiated = 'true';
                isModalOpen = true;
            }
        };

        const closeModal = () => {
            try {
                console.log('Closing modal');
                
                // Stop and clear modal video
                modalVideo.pause();
                modalVideo.currentTime = 0;
                modalVideo.src = '';
                modalVideo.load();
                
                // Remove any play overlay
                const overlay = modal.querySelector('.play-overlay');
                if (overlay) overlay.remove();
                
                // Clear modal state
                delete modalVideo.dataset.isModalVideo;
                delete modalVideo.dataset.userInitiated;
                isModalOpen = false;
                
                // Hide modal
                modal.classList.remove('is-open');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                
                // Resume background videos after a short delay
                setTimeout(() => {
                    resumeBackgroundVideos();
                }, 300);
                
                console.log('Modal closed successfully');
                
            } catch (error) {
                console.warn('Error closing video:', error);
            }
        };

        // Initialize all videos on page load for better performance
        const initializeVideos = () => {
            const videos = document.querySelectorAll('video:not(#modal-video)');
            videos.forEach(video => {
                // Set optimal attributes for cross-browser compatibility
                video.setAttribute('preload', 'metadata');
                video.setAttribute('playsinline', 'true');
                video.muted = true;
                
                // Add error handling
                video.addEventListener('error', (e) => {
                    console.warn('Video error:', video.currentSrc || video.src || 'unknown source', e);
                    const wrapper = video.closest('.panel-image-wrapper, .showcase-video-wrapper');
                    if (wrapper) {
                        wrapper.style.opacity = '0.5';
                        wrapper.setAttribute('title', 'Video unavailable');
                    }
                });

                // Loading states
                video.addEventListener('loadstart', () => {
                    const wrapper = video.closest('.panel-image-wrapper, .showcase-video-wrapper');
                    if (wrapper) wrapper.classList.add('loading');
                });

                video.addEventListener('loadeddata', () => {
                    const wrapper = video.closest('.panel-image-wrapper, .showcase-video-wrapper');
                    if (wrapper) wrapper.classList.remove('loading');
                });
            });
        };

        // Event listeners
        closeButton.addEventListener('click', closeModal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Prevent modal from closing when clicking on content
        const modalContent = modal.querySelector('.video-modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        });

        // Enhanced video click handling
        document.addEventListener('click', async (e) => {
            const video = e.target.closest('video');
            if (video && video.id !== 'modal-video' && !isModalOpen) {
                e.preventDefault();
                
                // Get video source
                const videoSrc = video.currentSrc || video.src || 
                    (video.querySelector('source') && video.querySelector('source').src);
                
                if (!videoSrc) {
                    console.warn('No video source found');
                    return;
                }
                
                console.log('Video clicked:', videoSrc);
                
                // Always open modal on desktop, handle mobile differently
                if (isMobileDevice()) {
                    // On mobile, try native fullscreen first, fallback to modal
                    try {
                        video.muted = false;
                        video.controls = true;
                        await video.play();
                        
                        // Try to enter fullscreen
                        if (video.requestFullscreen) {
                            await video.requestFullscreen();
                        } else if (video.webkitEnterFullscreen) {
                            await video.webkitEnterFullscreen();
                        } else {
                            // Fallback to modal
                            openModal(videoSrc, true);
                        }
                    } catch (error) {
                        console.warn('Mobile video failed, using modal:', error);
                        openModal(videoSrc, true);
                    }
                } else {
                    // Desktop: open modal with autoplay (user interaction detected)
                    openModal(videoSrc, true);
                }
            }
        });

        // Handle fullscreen exit events (for mobile)
        const handleFullscreenExit = () => {
            const isInFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );

            if (!isInFullscreen) {
                // Only handle non-modal videos that were in fullscreen
                const videos = document.querySelectorAll('video:not(#modal-video)');
                videos.forEach(video => {
                    if (video.controls && !video.muted) {
                        // Reset mobile video back to autoplay state
                        video.pause();
                        video.controls = false;
                        video.muted = true;
                        video.currentTime = 0;
                    }
                });
            }
        };

        // Fullscreen change listeners
        document.addEventListener('fullscreenchange', handleFullscreenExit);
        document.addEventListener('webkitfullscreenchange', handleFullscreenExit);
        document.addEventListener('mozfullscreenchange', handleFullscreenExit);
        document.addEventListener('MSFullscreenChange', handleFullscreenExit);

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !isModalOpen) {
                // Only pause background videos when page is hidden and modal is not open
                const videos = document.querySelectorAll('video:not(#modal-video)');
                videos.forEach(video => {
                    if (!video.paused) {
                        video.pause();
                    }
                });
            }
        });

        // Initialize videos
        initializeVideos();
        
        console.log('Video system initialized');
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