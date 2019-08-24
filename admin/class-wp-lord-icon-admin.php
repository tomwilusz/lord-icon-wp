<?php
namespace LordIcon;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function checkLottieData($data) {
    $neededForSingle = array("v", "w", "h", "nm", "assets", "layers");
    return empty(array_diff($neededForSingle, array_keys($data)));
}

function reArrayFiles(&$file_post) {

    $file_ary = array();
    $file_count = count($file_post['name']);
    $file_keys = array_keys($file_post);

    for ($i=0; $i<$file_count; $i++) {
        foreach ($file_keys as $key) {
            $file_ary[$i][$key] = $file_post[$key][$i];
        }
    }

    return $file_ary;
}


function handle_upload(){
    if(!isset($_FILES['icons'])) {
        return;
    }

    try {
        $icons = 0;
        $dir = plugin_dir_path( __DIR__ ) . 'icons/';
        $files = reArrayFiles($_FILES['icons']);

        foreach ($files as $file) {

            $text = file_get_contents($file["tmp_name"]);
            $data = json_decode($text, true);


            if (is_array($data)) {
                if (checkLottieData($data)) {
                    $name = basename($file["name"], '.json');
                    if (strlen($name)) {
                        $fp = fopen($dir . $name . '.json', 'w');
                        fwrite($fp, json_encode($data));
                        fclose($fp);
                        $icons += 1;
                    }
                } else  {
                    $iconsNames = array_keys($data);
                    foreach ($iconsNames as $iconName) {
                        $content = $data[$iconName];
                        if (checkLottieData($content)) {
                            $fp = fopen($dir . $iconName . '.json', 'w');
                            fwrite($fp, json_encode($content));
                            fclose($fp);
                            $icons += 1;
                        }
                    }
                }
            }
        }

        if ($icons > 0) {
            echo "Icons upload successful!";
        } else {
            echo "Missing icons!";
        }
     } catch (Exception $e) {
         echo 'Caught exception: ',  $e->getMessage(), "\n";
     }
}

function settings_page() {
?>
    <div class="wrap">
        <h1>Lordicon Settings</h1>

        <p>This is a place where you add Lottie (.json) animation.</p>
        <p>Accepted files:</p>
        <ul>
            <li>.json packs</li>
            <li>individual .json icons</li>
        </ul>
        <br/>
        <p>Need more interactive icons? <a target="_blank" href="https://lordicon.com/essential-pack">Explore entire Lordicon library</a>!</p>
        <br/>
<?php 
    handle_upload();
?>
        <form  method="post" enctype="multipart/form-data">
            <input type="file" id="icons" name="icons[]" multiple="multiple" accept=".json"></input>
            <?php submit_button('Upload icons') ?>
        </form>
    </div>
<?php
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
                '<a href="https://lordicon.com/essential-pack">Get more interactive icons</a>',
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

    public function admin_menu() {
        add_menu_page(
            'Lordicon Settings',
            'Lordicon',
            'administrator',
            __FILE__,
            '\LordIcon\settings_page'
        );
    }    
}