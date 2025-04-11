// Wait until the webpage has fully loaded before running our code
document.addEventListener('DOMContentLoaded', () => {
  // ===== SETUP: Find the important elements on the page =====
  const text = document.querySelector('.spotlight-text');
  const container = document.querySelector('.container');
  
  // ===== CONSTANTS: Store numbers we use multiple times =====
  // How fast the spotlight follows your mouse (higher = faster)
  const FOLLOW_SPEED = 0.08;
  
  // How long to wait before showing the text when page loads (in milliseconds)
  const ENTRANCE_DELAY = 300;
  
  // ===== VARIABLES: Store information that changes over time =====
  // Start the spotlight in the middle of the screen
  let mouseX = window.innerWidth / 2;  // X = left to right position
  let mouseY = window.innerHeight / 2; // Y = top to bottom position
  
  // Target position is where we want the spotlight to move to
  let targetX = mouseX;
  let targetY = mouseY;
  
  // ===== FUNCTIONS: Define the actions our code can perform =====
  
  /**
   * Make the spotlight follow your mouse smoothly
   * This runs many times per second to create animation
   */
  function animateSpotlight() {
    // Instead of jumping instantly to the mouse position,
    // move a percentage of the way there (smooth following)
    mouseX += (targetX - mouseX) * FOLLOW_SPEED;
    mouseY += (targetY - mouseY) * FOLLOW_SPEED;
    
    // Figure out where the text is on the page
    const rect = text.getBoundingClientRect();
    
    // Calculate the mouse position relative to the text
    // (so 0,0 is the top-left corner of the text)
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;
    
    // Update the CSS variables that control where the spotlight shows
    document.body.style.setProperty('--x', `${x}px`);
    document.body.style.setProperty('--y', `${y}px`);
    
    // Schedule this function to run again on the next frame
    // (this creates a smooth animation loop)
    requestAnimationFrame(animateSpotlight);
  }
  
  /**
   * Show the text with a nice fade-in and slide-up animation
   */
  function animateTextEntrance() {
    text.style.opacity = '1';
    text.style.transform = 'translateY(0)';
    
    // Also animate the subtitle text
    const subtitle = document.querySelector('.subtitle-text');
    if (subtitle) {
      setTimeout(() => {
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'translateY(0)';
      }, 200); // Small delay after main text starts animating
    }
  }

  // ===== EVENT LISTENERS: Respond to user actions =====
  
  // When the mouse moves over the text, update our target position
  text.addEventListener('mousemove', (e) => {
    targetX = e.clientX; // Mouse X position in the window
    targetY = e.clientY; // Mouse Y position in the window
  });
  
  // Even when not directly over the text, track the mouse
  // so the spotlight can smoothly move into position
  document.addEventListener('mousemove', (e) => {
    if (!text.matches(':hover')) {
      targetX = e.clientX;
      targetY = e.clientY;
    }
  });
  
  // ===== STARTUP: Begin animations =====
  
  // Start the spotlight animation
  animateSpotlight();
  
  // After a short delay, fade in the text
  setTimeout(animateTextEntrance, ENTRANCE_DELAY);

  // Initialize search functionality
  initSearch();

  // Initialize portfolio filtering if we're on the work page
  if (document.querySelector('.portfolio-grid')) {
    initPortfolioFilters();
  }
});

/**
 * Set up search form functionality
 * This creates a simple search across page content
 */
function initSearch() {
  const searchForm = document.querySelector('.search-form');
  const searchInput = document.querySelector('.search-input');
  
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent form submission
      
      const searchTerm = searchInput.value.trim().toLowerCase();
      if (!searchTerm) return; // Don't search if empty
      
      // This is a simple in-page search
      // You can customize this to search specific elements
      searchPageContent(searchTerm);
      
      // Optionally, clear the search field after searching
      // searchInput.value = '';
    });
  }
}

/**
 * Search through the page content
 * This is a basic implementation that highlights matches
 */
function searchPageContent(term) {
  // Clear any previous highlights
  clearHighlights();
  
  // Simple approach: search text nodes in the body
  const textNodes = getTextNodes(document.body);
  let matchCount = 0;
  
  textNodes.forEach(node => {
    const content = node.nodeValue;
    if (content.toLowerCase().includes(term)) {
      // Found a match, highlight it
      const highlightedText = highlightMatches(content, term);
      
      // Create a new element with the highlighted content
      const span = document.createElement('span');
      span.innerHTML = highlightedText;
      
      // Replace the text node with our highlighted version
      node.parentNode.replaceChild(span, node);
      matchCount++;
    }
  });
  
  // Show feedback to user about search results
  alert(`Found ${matchCount} matches for "${term}"`);
}

/**
 * Get all text nodes within an element
 */
function getTextNodes(element) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    { acceptNode: node => node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
  );
  
  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  
  return textNodes;
}

/**
 * Add highlight spans around matching text
 */
function highlightMatches(text, term) {
  // Case insensitive replace
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

/**
 * Clear all highlighted matches
 */
function clearHighlights() {
  const highlights = document.querySelectorAll('.search-highlight');
  highlights.forEach(highlight => {
    // Get the parent span
    const parent = highlight.parentNode;
    
    // Replace the span with its text content
    if (parent && parent.tagName === 'SPAN') {
      const text = document.createTextNode(parent.textContent);
      parent.parentNode.replaceChild(text, parent);
    }
  });
}

/**
 * Sets up the portfolio filtering functionality
 * Allows visitors to filter projects by category
 */
function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get the filter value
        const filterValue = button.getAttribute('data-filter');
        
        // Filter the projects
        projectCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          
          // Add fancy animation when filtering
          card.style.transition = 'all 0.4s ease';
          
          if (filterValue === 'all' || cardCategory.includes(filterValue)) {
            // Show the card with animation
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9) translateY(20px)';
            card.style.display = 'flex';
            
            // Small delay for staggered animation
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1) translateY(0)';
            }, 50 * Array.from(projectCards).indexOf(card));
          } else {
            // Hide the card with animation
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9) translateY(20px)';
            
            setTimeout(() => {
              card.style.display = 'none';
            }, 400);
          }
        });
      });
    });
  }
}
