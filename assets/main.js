document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('.doc-link');
    const content = document.getElementById('content');
    const contentWrapper = document.querySelector('.content-wrapper');
    const overviewList = document.getElementById('overview-list');
    const overviewToggle = document.getElementById('overview-toggle');
    const overviewArrow = document.getElementById('overview-arrow');

    const tocLinkSelector = '.toc-link, .toc-list a';
    const headingSelector = 'h1, h2, h3, h4, h5, h6';
    const fileContainerSelector = '.file-container';
    const tocContainerSelector = '.toc-container';

    let currentFileUrl = '';
    let manuallyClickedTocLink = null;
    let manualClickTimeout = null;
    let sidebarCollapsed = false;


    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function getCurrentFileUrl() {
        return currentFileUrl;
    }

    function getFileUrlFromTOC(tocItemId) {
        const tocItem = document.querySelector(`[href="#${tocItemId}"]`);
        if (tocItem) {
            const fileContainer = tocItem.closest('.file-container');
            if (fileContainer) {
                const fileLink = fileContainer.querySelector('.doc-link');
                if (fileLink) {
                    return fileLink.getAttribute('href');
                }
            }
        }
        return '';
    }

    function processContent(htmlContent) {
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;

        const headings = temp.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingCounts = {};

        headings.forEach((heading, index) => {
            const headingText = heading.textContent.trim();
            const sanitizedText = headingText
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            
            headingCounts[headingText] = (headingCounts[headingText] || 0) + 1;
            const count = headingCounts[headingText];
            
            const baseId = sanitizedText || `heading-${index}`;
            const headingId = count > 1 ? `${baseId}-${count}` : baseId;
            
            heading.id = headingId;
        });

        return temp.innerHTML;
    }


    function buildHierarchy(headings) {
        const hierarchy = [];
        const stack = [];
        const headingCounts = {};

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            const headingText = heading.textContent.trim();
            const sanitizedText = headingText
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            
            headingCounts[headingText] = (headingCounts[headingText] || 0) + 1;
            const count = headingCounts[headingText];
            
            const baseId = sanitizedText || `heading-${index}`;
            const headingId = count > 1 ? `${baseId}-${count}` : baseId;
            
            heading.id = headingId;

            const node = {
                heading: heading,
                level: level,
                children: [],
                id: headingId
            };

            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            if (stack.length === 0) {
                hierarchy.push(node);
            } else {
                stack[stack.length - 1].children.push(node);
            }

            stack.push(node);
        });

        return hierarchy;
    }

    function createTOCItem(node, depth = 0) {
        const li = document.createElement('li');
        li.style.cssText = 'margin: 2px 0;';

        const itemContainer = document.createElement('div');
        itemContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 0;
        `;

        const link = document.createElement('a');
        link.href = `#${node.id}`;
        link.textContent = node.heading.textContent;
        link.className = 'toc-link';
        link.style.cssText = `
            color: #6c757d;
            text-decoration: none;
            flex: 1;
            font-size: 12px;
            border-radius: 3px;
            transition: all 0.2s ease;
            padding: 4px 6px;
            display: block;
            position: relative;
        `;

        addTOCLinkEventListeners(link, node);
        itemContainer.appendChild(link);

        let arrow = null;
        if (node.children.length > 0) {
            arrow = document.createElement('span');
            arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" style="transform: rotate(-90deg);">
                <g fill="none" fill-rule="evenodd" transform="translate(-446 -398)">
                  <path fill="currentColor" fill-rule="nonzero"
                    d="M95.8838835,240.366117 C95.3957281,239.877961 94.6042719,239.877961 94.1161165,240.366117 C93.6279612,240.854272 93.6279612,241.645728 94.1161165,242.133883 L98.6161165,246.633883 C99.1042719,247.122039 99.8957281,247.122039 100.383883,246.633883 L104.883883,242.133883 C105.372039,241.645728 105.372039,240.854272 104.883883,240.366117 C104.395728,239.877961 103.604272,239.877961 103.116117,240.366117 L99.5,243.982233 L95.8838835,240.366117 Z"
                    transform="translate(356.5 164.5)" />
                  <polygon points="446 418 466 418 466 398 446 398" />
                </g>
              </svg>`;
            arrow.style.cssText = `
                transition: transform 0.2s;
                cursor: pointer;
                color: #6c757d;
                display: flex;
                align-items: center;
            `;
            itemContainer.appendChild(arrow);
        }

        li.appendChild(itemContainer);

        if (node.children.length > 0) {
            const childrenList = document.createElement('ul');
            childrenList.style.cssText = `
                list-style: none;
                padding-left: 15px;
                margin: 0;
                display: none;
            `;

            node.children.forEach((childNode) => {
                const childLi = createTOCItem(childNode, depth + 1);
                childrenList.appendChild(childLi);
            });

            li.appendChild(childrenList);

            addArrowEventListeners(arrow, childrenList);
        }

        return li;
    }

    function addTOCLinkEventListeners(link, node) {
        link.addEventListener('mouseenter', () => {
            if (!link.classList.contains('active')) {
                link.style.backgroundColor = '#e9ecef';
                link.style.color = '#495057';
            }
        });

        link.addEventListener('mouseleave', () => {
            if (!link.classList.contains('active')) {
                link.style.backgroundColor = '';
                link.style.color = '';
            }
        });

        link.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            link.style.transform = 'scale(0.95)';
            setTimeout(() => {
                link.style.transform = '';
            }, 150);

            manuallyClickedTocLink = link;

            if (manualClickTimeout) {
                clearTimeout(manualClickTimeout);
            }

            manualClickTimeout = setTimeout(() => {
                manuallyClickedTocLink = null;
            }, 2000);

            document.querySelectorAll(tocLinkSelector).forEach((tocLink) => {
                if (tocLink.classList.contains('active')) {
                    tocLink.style.transition = 'all 0.3s ease';
                    tocLink.classList.remove('active');

                    setTimeout(() => {
                        tocLink.style.transition = '';
                    }, 300);
                }

                tocLink.style.backgroundColor = '';
                tocLink.style.color = '';
                tocLink.style.transform = '';
            });

            link.style.transition = 'all 0.3s ease';
            link.classList.add('active');

            setTimeout(() => {
                link.style.transition = '';
            }, 300);

            await handleTOCItemClick(node);

            const sidebarEl = document.getElementById('sidebar');
            if (sidebarEl) sidebarEl.classList.remove('active');
            const modalFade = document.querySelector('.modal-fade');
            if (modalFade) modalFade.classList.remove('active');

            const li = link.closest('li');
            if (li && node.children.length > 0) {
                const childrenList = li.querySelector('ul');
                if (childrenList) {
                    childrenList.style.display = 'block';
                    const arrow = li.querySelector('span:last-child');
                    if (arrow) {
                        arrow.style.transform = 'rotate(90deg)';
                    }
                }
            }
        });
    }

    function addArrowEventListeners(arrow, childrenList) {
        let childrenCollapsed = true;
        arrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            childrenCollapsed = !childrenCollapsed;
            childrenList.style.display = childrenCollapsed ? 'none' : 'block';
            arrow.style.transform = childrenCollapsed
                ? 'rotate(0deg)'
                : 'rotate(90deg)';
        });
    }

    async function handleTOCItemClick(node) {
        const contentArea = document.getElementById('content');
        const currentFileUrl = getCurrentFileUrl();
        const targetFileUrl = getFileUrlFromTOC(node.id);

        if (currentFileUrl !== targetFileUrl) {
            window.history.pushState({}, '', targetFileUrl);
            await loadFileContent(targetFileUrl);
        }

        setTimeout(() => {
            scrollToHeading(node.id, node.heading.textContent);

            setTimeout(() => {
                clearManualClick();
            }, 1000);
        }, 100);
    }

    function scrollToHeading(headingId, headingText) {
        const targetHeading = contentWrapper.querySelector(`#${headingId}`);

        if (targetHeading) {
            scrollToElement(targetHeading);
        } else {
            const allHeadings =
                contentWrapper.querySelectorAll(headingSelector);
            const matchingHeading = Array.from(allHeadings).find(
                (h) => h.textContent.trim() === headingText.trim()
            );

            if (matchingHeading) {
                scrollToElement(matchingHeading);
            }
        }
    }

    function scrollToElement(element) {
        const rect = element.getBoundingClientRect();
        const contentRect = contentWrapper.getBoundingClientRect();
        const scrollTop = contentWrapper.scrollTop;
        const targetPosition = scrollTop + rect.top - contentRect.top - 100;

        contentWrapper.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        element.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 2000);
    }

    function generateTOC(htmlContent) {
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;

        const headings = temp.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) return null;

        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';
        tocList.style.cssText = `
            list-style: none;
            padding-left: 0;
            margin: 0;
            display: none;
        `;

        const hierarchy = buildHierarchy(headings);
        hierarchy.forEach((node) => {
            const li = createTOCItem(node);
            tocList.appendChild(li);
        });

        return tocList;
    }

    function addCopyClipboard() {
        document.querySelectorAll("pre > code").forEach((codeBlock) => {
            const svgCopy = `
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true">
                    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                </svg>
            `
            const svgDone = `
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="#1a7f37" data-view-component="true">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                </svg>
            `
            const button = document.createElement("div");
            const iconBtn = document.createElement("div");
            iconBtn.className = "copy__icon--button-inner";
            button.className = "copy__icon--button";
            button.appendChild(iconBtn);
            iconBtn.innerHTML = svgCopy;
        
            const pre = codeBlock.parentNode;
            pre.style.display = "flex";
            pre.style.justifyContent = "space-between";
        
            if(iconBtn) {
                iconBtn.addEventListener("click", () => {
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(codeBlock.textContent)
                            .then(() => {
                                iconBtn.innerHTML = svgDone;
                                setTimeout(() => (iconBtn.innerHTML = svgCopy), 1500);
                            })
                            .catch(() => {
                                alert("Failed to copy to clipboard.");
                            });
                    } else {
                        alert("Clipboard API is not supported");
                    }
                });
            }
        
            pre.appendChild(button);
        });
    }


    async function loadFileContent(fileUrl) {
        try {
            document
                .querySelectorAll('.doc-link')
                .forEach((l) => l.classList.remove('active'));

            const fileLink = document.querySelector(
                `.doc-link[href="${fileUrl}"]`
            );
            if (fileLink) {
                fileLink.classList.add('active');
            }

            updateFileHeaderActiveState(fileUrl);

            const url = fileUrl + 'index.html';
            const res = await fetch(url);
            const html = await res.text();

            const temp = document.createElement('div');
            temp.innerHTML = html;
            let bodyContent = '';
            const contentDiv = temp.querySelector('#content');
            if (contentDiv) {
                bodyContent = contentDiv.innerHTML;
            } else {
                bodyContent = temp.querySelector('body')?.innerHTML || html;
            }

            const processedContent = processContent(bodyContent);
            content.innerHTML = processedContent;

            currentFileUrl = fileUrl;

            await autoExpandTOCForFile(fileUrl);

            contentWrapper.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            startScrollSpy();
            addCopyClipboard();
        } catch (err) {
            content.innerHTML =
                "<p style='color:red;'>Can not load content.</p>";
        }
    }

    function updateFileHeaderActiveState(fileUrl) {
        document.querySelectorAll('.file-title').forEach((title) => {
            title.classList.remove('active');
        });
 
        const fileLink = document.querySelector(`.doc-link[href="${fileUrl}"]`);
        if (fileLink) {
            const fileContainer = fileLink.closest('.file-container');
            if (fileContainer) {
                const fileTitle = fileContainer.querySelector('.file-title');
                if (fileTitle) {
                    fileTitle.classList.add('active');
                }
            }
        }
    }

    function startScrollSpy() {
        const headings = contentWrapper.querySelectorAll(headingSelector);

        contentWrapper.removeEventListener('scroll', handleScroll);

        const debouncedHandleScroll = debounce(handleScroll, 10);

        contentWrapper.addEventListener('scroll', debouncedHandleScroll);

        setTimeout(() => {
            handleScroll();
        }, 200);

    }

    function clearManualClick() {
        manuallyClickedTocLink = null;
        if (manualClickTimeout) {
            clearTimeout(manualClickTimeout);
            manualClickTimeout = null;
        }
    }

    function handleScroll() {
        const headings = contentWrapper.querySelectorAll(headingSelector);

        if (headings.length === 0) {
            return;
        }

        const contentRect = contentWrapper.getBoundingClientRect();
        const offset = 50;

        let activeHeading = null;

        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            const rect = heading.getBoundingClientRect();
            const headingTop = rect.top - contentRect.top;

            if (headingTop <= offset) {
                activeHeading = heading;
                break;
            }
        }

        if (!activeHeading) {
            activeHeading = headings[0];
        }

        updateTOCActiveState(activeHeading);
    }

    function updateTOCActiveState(activeHeading) {
        if (manuallyClickedTocLink) {
            return;
        }

        const allTocLinks = document.querySelectorAll(tocLinkSelector);

        allTocLinks.forEach((link) => {
            if (link.classList.contains('active')) {
                link.style.transition = 'all 0.3s ease';
                link.classList.remove('active');

                setTimeout(() => {
                    link.style.transition = '';
                }, 300);
            }

            link.style.backgroundColor = '';
            link.style.color = '';
            link.style.transform = '';
        });

        if (activeHeading) {
            let tocLink = null;

            tocLink = document.querySelector(`[href="#${activeHeading.id}"]`);

            if (!tocLink) {
                const allTocLinks = document.querySelectorAll(tocLinkSelector);
                allTocLinks.forEach((link) => {
                    if (
                        link.textContent.trim() ===
                        activeHeading.textContent.trim()
                    ) {
                        tocLink = link;
                    }
                });
            }

            if (!tocLink) {
                allTocLinks.forEach((link) => {
                    if (
                        link.textContent.includes(activeHeading.textContent) ||
                        activeHeading.textContent.includes(link.textContent)
                    ) {
                        tocLink = link;
                    }
                });
            }

            if (tocLink) {
                tocLink.style.transition = 'all 0.3s ease';
                tocLink.classList.add('active');

                setTimeout(() => {
                    tocLink.style.transition = '';
                }, 300);

                const tocContainer = tocLink.closest(tocContainerSelector);
                if (tocContainer) {
                    const tocList = tocContainer.querySelector('.toc-list');
                    if (tocList && tocList.style.display !== 'none') {
                        setTimeout(() => {
                            tocLink.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'nearest'
                            });
                        }, 50);
                    }
                }
            }
        }

        autoExpandTOCForHeading(activeHeading);
    }

    function isChildHeading(heading) {
        const level = parseInt(heading.tagName.charAt(1));
        return level >= 3;
    }

    function autoExpandTOCForHeading(activeHeading) {
        if (!activeHeading) return;

        if (!isChildHeading(activeHeading)) {
            return;
        }

        let tocLink = document.querySelector(`[href="#${activeHeading.id}"]`);

        if (!tocLink) {
            const allTocLinks = document.querySelectorAll(tocLinkSelector);
            allTocLinks.forEach((link) => {
                if (
                    link.textContent.trim() === activeHeading.textContent.trim()
                ) {
                    tocLink = link;
                }
            });
        }

        if (!tocLink) {
            return;
        }

        const tocContainer = tocLink.closest(tocContainerSelector);
        if (!tocContainer) {
            return;
        }

        const tocList = tocContainer.querySelector('.toc-list');
        if (tocList && tocList.style.display === 'none') {
            const fileContainer = tocContainer.closest(fileContainerSelector);
            if (fileContainer) {
                const arrow = fileContainer.querySelector(
                    '.file-header span:last-child'
                );
                if (arrow) {
                    arrow.click();

                    setTimeout(() => {
                        tocLink.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'nearest'
                        });
                    }, 300);
                }
            }
        }

        let currentLi = tocLink.closest('li');
        while (currentLi) {
            const parentUl = currentLi.parentElement;
            if (parentUl && parentUl.style.display === 'none') {
                const parentLiContainer = parentUl.closest('li');
                if (parentLiContainer) {
                    const parentArrow =
                        parentLiContainer.querySelector('span:last-child');
                    if (parentArrow) {
                        parentArrow.click();
                    }
                }
            }
            currentLi = parentUl ? parentUl.closest('li') : null;
        }
    }

    async function loadTOCForFile(fileUrl, tocContainer) {
        try {
            const url = fileUrl + 'index.html';
            const res = await fetch(url);
            const html = await res.text();

            const temp = document.createElement('div');
            temp.innerHTML = html;
            let bodyContent = '';
            const contentDiv = temp.querySelector('#content');
            if (contentDiv) {
                bodyContent = contentDiv.innerHTML;
            } else {
                bodyContent = temp.querySelector('body')?.innerHTML || html;
            }

            const toc = generateTOC(bodyContent);
            if (toc) {
                tocContainer.appendChild(toc);
            }
        } catch (err) {
            console.error('Can not load TOC:', err);
        }
    }

    function toggleTOCVisibility(tocContainer, arrow, collapsed) {
        const tocList = tocContainer.querySelector('.toc-list');
        if (tocList) {
            tocList.style.display = collapsed ? 'none' : 'block';
        }

        arrow.style.transform = collapsed ? 'rotate(0deg)' : 'rotate(90deg)';
    }

    async function autoExpandTOCForFile(fileUrl) {
        const fileContainer = document
            .querySelector(`.doc-link[href="${fileUrl}"]`)
            ?.closest('.file-container');
        if (!fileContainer) return;

        const arrow = fileContainer.querySelector(
            '.file-header .file-title + span'
        );
        const tocContainer = fileContainer.querySelector('.toc-container');

        if (!arrow || !tocContainer) return;

        const tocList = tocContainer.querySelector('.toc-list');
        if (!tocList) {
            await loadTOCForFile(fileUrl, tocContainer);
        }

        toggleTOCVisibility(tocContainer, arrow, false);
    }


    function initialize() {
        overviewList.innerHTML = '';

        const existingLinks = Array.from(links);
        existingLinks.forEach((link, index) => {
            const fileContainer = createFileItemFromLink(link);
            overviewList.appendChild(fileContainer);
        });

        if (existingLinks.length > 0) {
            const currentPath = window.location.pathname;
            let matchedLink = existingLinks.find(
                (link) => link.getAttribute('href') === currentPath
            );
            let fileUrl = matchedLink
                ? currentPath
                : existingLinks[0].getAttribute('href');
            if (!matchedLink) {
                window.history.replaceState({}, '', fileUrl);
            }
            currentFileUrl = fileUrl;
            loadFileContent(fileUrl);
            const fileLink = document.querySelector(
                `.doc-link[href="${fileUrl}"]`
            );
            if (fileLink) fileLink.classList.add('active');
            updateFileHeaderActiveState(fileUrl);
        }

        initializeOverviewToggle();
    }

    function createFileItemFromLink(link) {
        const fileContainer = document.createElement('div');
        fileContainer.className = 'file-container';
        fileContainer.style.cssText = 'margin-bottom: 12px;';

        const fileHeader = document.createElement('div');
        fileHeader.className = 'file-header';
        fileHeader.style.cssText = `
            display: flex;
            align-items: center;
            padding: 0;
            color: #495057;
        `;

        const title = document.createElement('span');
        title.textContent = link.textContent;
        title.className = 'file-title';
        title.style.cssText = `
            font-weight: bold;
            cursor: pointer;
        `;

        const arrow = document.createElement('span');
        arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" style="transform: rotate(-90deg);">
            <g fill="none" fill-rule="evenodd" transform="translate(-446 -398)">
              <path fill="currentColor" fill-rule="nonzero"
                d="M95.8838835,240.366117 C95.3957281,239.877961 94.6042719,239.877961 94.1161165,240.366117 C93.6279612,240.854272 93.6279612,241.645728 94.1161165,242.133883 L98.6161165,246.633883 C99.1042719,247.122039 99.8957281,247.122039 100.383883,246.633883 L104.883883,242.133883 C105.372039,241.645728 105.372039,240.854272 104.883883,240.366117 C104.395728,239.877961 103.604272,239.877961 103.116117,240.366117 L99.5,243.982233 L95.8838835,240.366117 Z"
                transform="translate(356.5 164.5)" />
              <polygon points="446 418 466 418 466 398 446 398" />
            </g>
          </svg>`;
        arrow.style.cssText = `
            transition: transform 0.2s;
            cursor: pointer;
            display: flex;
            align-items: center;
        `;

        fileHeader.appendChild(title);
        fileHeader.appendChild(arrow);

        const fileLink = document.createElement('a');
        fileLink.href = link.getAttribute('href');
        fileLink.className = 'doc-link';
        fileLink.style.cssText = `
            color: #007bff;
            text-decoration: none;
            display: block;
            padding: 0;
            margin-left: 16px;
        `;

        const tocContainer = document.createElement('div');
        tocContainer.className = 'toc-container';
        tocContainer.style.cssText = `
            margin-left: 16px;
            margin-top: 4px;
        `;

        addFileEventListenersFromLink(
            arrow,
            title,
            fileLink,
            tocContainer,
            link
        );

        fileContainer.appendChild(fileHeader);
        fileContainer.appendChild(fileLink);
        fileContainer.appendChild(tocContainer);

        return fileContainer;
    }

    function addFileEventListenersFromLink(
        arrow,
        title,
        fileLink,
        tocContainer,
        link
    ) {
        let tocLoaded = false;
        let tocCollapsed = true;

        arrow.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            tocCollapsed = !tocCollapsed;

            if (!tocLoaded) {
                await loadTOCForFile(link.getAttribute('href'), tocContainer);
                tocLoaded = true;
            }

            toggleTOCVisibility(tocContainer, arrow, tocCollapsed);
        });

        title.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = link.getAttribute('href');
        });

        fileLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const href = fileLink.getAttribute('href');
            window.history.pushState({}, '', href);
            loadFileContent(href);
        });
    }

    function initializeOverviewToggle() {
        overviewToggle.addEventListener('click', () => {
            sidebarCollapsed = !sidebarCollapsed;
            overviewList.style.display = sidebarCollapsed ? 'none' : 'block';

            const svg = overviewArrow.querySelector('svg');
            if (svg) {
                svg.style.transition = 'transform 0.2s';
                svg.style.transform = sidebarCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
            }
        });
    }

    initialize();

    window.addEventListener('popstate', function (event) {
        const path = window.location.pathname;
        const docLink = document.querySelector(`.doc-link[href="${path}"]`);
        if (docLink) {
            loadFileContent(path);
        }
    });
});