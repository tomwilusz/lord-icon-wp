<?php
namespace LordIcon;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_LordIcon_Admin {
    function __construct() {
        add_filter( 'plugin_row_meta', array( $this, 'plugin_links' ), 10, 4 );
    }

    public function enqueue_styles() {
    }

    public function enqueue_scripts() {
    }

    public function plugin_links( $plugin_links, $plugin_file, $plugin_data ) {
        $links = array();
		if ( isset( $plugin_data['AuthorName'] ) && $plugin_data['AuthorName'] == 'Lordicon'  ) {
            $links = array(
                '<a href="https://lordicon.com/icons">Get more interactive icons</a>',
            );
		}
        return array_merge( $plugin_links, $links );
    }

    public function enqueue_block_editor_assets() {
        wp_enqueue_script(
            'lordicon-editor-js',
            plugins_url( '/dist/editor.js', dirname( __FILE__ ) ),
            array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-editor'),
            WP_LordIcon_Constants::plugin_version()
        );

        wp_enqueue_style(
            'lordicon-editor-css',
            plugins_url( 'dist/editor.css', dirname( __FILE__ ) ),
            array( 'wp-edit-blocks' ),
            WP_LordIcon_Constants::plugin_version()
        );
    }
}