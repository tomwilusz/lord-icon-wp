<?php
namespace LordIcon;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_LordIcon_Loader {
	protected $actions;
	protected $filters;
	protected $shortcodes;

	public function __construct() {
		$this->actions = array();
		$this->filters = array();
		$this->shortcodes = array();
    }

	public function add_action( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
		$this->actions[] = array(
			'hook'          => $hook,
			'component'     => $component,
			'callback'      => $callback,
			'priority'      => $priority,
			'accepted_args' => $accepted_args
		);
	}

	public function add_filter( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
		$this->filters[] = array(
			'hook'          => $hook,
			'component'     => $component,
			'callback'      => $callback,
			'priority'      => $priority,
			'accepted_args' => $accepted_args
		);
	}

	public function add_shortcode( $tag, $component, $callback ) {
		$this->shortcodes[] = array(
			'tag'		=> $tag,
			'component'	=> $component,
			'callback'	=> $callback,
		);
	}

	public function run() {
		foreach ( $this->filters as $hook ) {
			add_filter( $hook['hook'], array( $hook['component'], $hook['callback'] ), $hook['priority'], $hook['accepted_args'] );
		}

		foreach ( $this->actions as $hook ) {
			add_action( $hook['hook'], array( $hook['component'], $hook['callback'] ), $hook['priority'], $hook['accepted_args'] );
		}

		foreach ( $this->shortcodes as $shortcode ) {
			add_shortcode( $shortcode['tag'], array( $shortcode['component'], $shortcode['callback'] ) );
		}
	}
}