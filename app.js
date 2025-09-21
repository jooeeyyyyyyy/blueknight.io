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

    const initAiShowcaseAnimations = () => {
        const aiShowcaseSection = document.getElementById('ai-showcase');
        if (!aiShowcaseSection) return;

        const aiMessages = aiShowcaseSection.querySelectorAll('.ai-message');
        if (aiMessages.length === 0) return;

        // Create intersection observer for the AI showcase section
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Section is visible, show messages with staggered delay
                    aiMessages.forEach((message, index) => {
                        setTimeout(() => {
                            message.classList.add('is-visible');
                        }, index * 700); // 700ms delay between each message
                    });
                } else {
                    // Section is not visible, hide messages
                    aiMessages.forEach(message => {
                        message.classList.remove('is-visible');
                    });
                }
            });
        }, {
            threshold: 0.3, // Trigger when 30% of the section is visible
            rootMargin: '0px 0px -10% 0px' // Add some margin to trigger slightly before fully visible
        });

        observer.observe(aiShowcaseSection);
        
        console.log('AI showcase viewport animations initialized');
    };

    const initVideoSystem = () => {
        const modal = document.getElementById('video-modal');
        const playerContainer = document.getElementById('youtube-player-container');
        const closeButton = modal.querySelector('.video-modal-close');
        
        if (!modal || !playerContainer || !closeButton) return;

        // Global state for modal and YouTube player
        let isModalOpen = false;
        let backgroundVideos = [];
        let youtubePlayer = null;
        let isYouTubeAPIReady = false;

        // Helper function to detect mobile devices
        const isMobileDevice = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
        };

        // Extract YouTube video ID from various URL formats
        const extractYouTubeId = (url) => {
            if (!url) return null;
            
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : url; // Return ID or assume it's already an ID
        };

        // Pause all background videos when modal opens
        const pauseAllBackgroundVideos = () => {
            backgroundVideos = [];
            const videos = document.querySelectorAll('video');
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
                if (videoData.wasPlaying && video) {
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

        // Initialize YouTube API when ready
        window.onYouTubeIframeAPIReady = () => {
            isYouTubeAPIReady = true;
            console.log('YouTube API ready');
        };

        // Create YouTube player
        const createYouTubePlayer = (videoId) => {
            return new Promise((resolve, reject) => {
                if (!isYouTubeAPIReady || !window.YT) {
                    reject(new Error('YouTube API not ready'));
                    return;
                }

                // Clear any existing player
                if (youtubePlayer) {
                    try {
                        youtubePlayer.destroy();
                    } catch (e) {
                        console.warn('Error destroying previous player:', e);
                    }
                }

                // Clear container
                playerContainer.innerHTML = '';

                try {
                    youtubePlayer = new YT.Player(playerContainer, {
                        height: '100%',
                        width: '100%',
                        videoId: videoId,
                        playerVars: {
                            autoplay: 1,        // Enable autoplay
                            mute: 0,            // Start unmuted (YouTube handles autoplay policies)
                            controls: 1,        // Show controls
                            showinfo: 0,        // Hide video info
                            rel: 0,             // Don't show related videos
                            iv_load_policy: 3,  // Hide annotations
                            modestbranding: 1,  // Modest YouTube branding
                            playsinline: 1,     // Play inline on mobile
                            fs: 1,              // Allow fullscreen
                            cc_load_policy: 0,  // Don't show captions by default
                            disablekb: 0,       // Enable keyboard controls
                            enablejsapi: 1      // Enable JS API
                        },
                        events: {
                            onReady: (event) => {
                                console.log('YouTube player ready');
                                // Auto-play the video
                                try {
                                    event.target.playVideo();
                                } catch (e) {
                                    console.warn('Autoplay failed:', e);
                                }
                                resolve(event.target);
                            },
                            onStateChange: (event) => {
                                console.log('YouTube player state:', event.data);
                            },
                            onError: (event) => {
                                console.error('YouTube player error:', event.data);
                                reject(new Error(`YouTube player error: ${event.data}`));
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error creating YouTube player:', error);
                    reject(error);
                }
            });
        };

        // Open modal with YouTube video
        const openModal = async (videoId, userInitiated = true) => {
            try {
                console.log('Opening modal with YouTube video:', videoId);
                
                // First, pause all background videos
                pauseAllBackgroundVideos();
                
                // Set modal state
                isModalOpen = true;
                
                // Show modal
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                
                // Wait for YouTube API if not ready
                if (!isYouTubeAPIReady) {
                    console.log('Waiting for YouTube API...');
                    let attempts = 0;
                    while (!isYouTubeAPIReady && attempts < 50) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        attempts++;
                    }
                    
                    if (!isYouTubeAPIReady) {
                        throw new Error('YouTube API failed to load');
                    }
                }
                
                // Create YouTube player
                await createYouTubePlayer(videoId);
                
                // Focus close button for accessibility
                setTimeout(() => {
                    if (closeButton) closeButton.focus();
                }, 500);
                
                console.log('Modal opened successfully with YouTube player');
                
            } catch (error) {
                console.error('Failed to open YouTube modal:', error);
                // Fallback: show modal with error message
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                playerContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 400px; background: #000; color: white; text-align: center; border-radius: 12px;">
                        <div>
                            <h3>Video Unavailable</h3>
                            <p>Unable to load YouTube video. Please try again later.</p>
                            <a href="https://youtube.com/watch?v=${videoId}" target="_blank" style="color: #3b82f6;">Watch on YouTube</a>
                        </div>
                    </div>
                `;
                isModalOpen = true;
            }
        };

        // Close modal and cleanup YouTube player
        const closeModal = () => {
            try {
                console.log('Closing modal');
                
                // Stop YouTube player
                if (youtubePlayer) {
                    try {
                        youtubePlayer.pauseVideo();
                        youtubePlayer.destroy();
                        youtubePlayer = null;
                    } catch (e) {
                        console.warn('Error stopping YouTube player:', e);
                    }
                }
                
                // Clear container
                playerContainer.innerHTML = '';
                
                // Clear modal state
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
                console.warn('Error closing video modal:', error);
            }
        };

        // Initialize all videos on page load
        const initializeVideos = () => {
            const videos = document.querySelectorAll('video');
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

        // Enhanced video click handling - now opens YouTube videos
        document.addEventListener('click', async (e) => {
            const video = e.target.closest('video');
            const heroButton = e.target.closest('#hero-demo-button');
            
            // Handle hero demo button click
            if (heroButton && !isModalOpen) {
                e.preventDefault();
                
                const youtubeId = heroButton.dataset.youtubeId;
                
                if (!youtubeId) {
                    console.warn('No YouTube ID found for hero button');
                    return;
                }
                
                console.log('Hero demo button clicked, opening YouTube:', youtubeId);
                openModal(youtubeId, true);
                return;
            }
            
            // Handle video click
            if (video && !isModalOpen) {
                e.preventDefault();
                
                // Get YouTube ID from data attribute
                const youtubeId = video.dataset.youtubeId;
                
                if (!youtubeId) {
                    console.warn('No YouTube ID found for video');
                    return;
                }
                
                console.log('Video clicked, opening YouTube:', youtubeId);
                
                // For both mobile and desktop, open YouTube in modal
                // YouTube player handles mobile optimization automatically
                openModal(youtubeId, true);
            }
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !isModalOpen) {
                // Only pause background videos when page is hidden and modal is not open
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                    if (!video.paused) {
                        video.pause();
                    }
                });
            }
        });

        // Initialize videos
        initializeVideos();
        
        console.log('YouTube video system initialized');
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
    initAiShowcaseAnimations();
    initVideoSystem();
});