

// LINK: (plugin_11ty_image.js)[../../scripts/plugin_11ty_image.js]

/*
Steps:
	1. Wait for all min. images to load (they can still have priorities but its kindof pointless since they should be instant)
	2. Load 'high' priority images, in this suborder: optimized-only images, raw images, and then the pairs to min. 
	3. Load 'auto' priority images, same suborder
	4. Load 'low'  priority images, same suborder
*/

