<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class ManifestExtension extends AbstractExtension
{
    private $manifestFile;

    public function __construct($manifestFile)
    {
        $this->manifestFile = $manifestFile;
    }

    public function getFunctions() : array
    {
        return array(
            new TwigFunction('manifest', [$this, 'manifest']),
            new TwigFunction('selectvalues', [$this, 'selectvalues']),
            new TwigFunction('dump', [$this, 'dump']),
            new TwigFunction('intervaltime', [$this, 'intervaltime']),
            new TwigFunction('bnbmerge', [$this, 'bnbmerge']),
        );
    }

    public function getFilters() : array {
        return array(
            'json_decode'   => new TwigFilter('json_decode', [$this, 'json_decode']),
            'float'   => new TwigFilter('float', [$this, 'float']),
        );
    }

    public function manifest()
    {
        $content = file_get_contents($this->manifestFile);

        return $content;
    }

    public function json_decode($str) {
        return json_decode((string)$str);
    }

    public function selectvalues($formdata, $value) {
        foreach($formdata as $item) {
            if ($item->key === $value) {
                return $item->label;
            }
        }

        return $value;
    }

    public function dump($var) {
        dump($var);
    }

    public function float($string) {
        $string = str_replace(',', '.', $string);

        return (float)$string;
    }

    public function intervaltime($start, $duration) {
        $zeitstring = date("H:i", strtotime($start .' + '.$duration.' minutes'));

        return $zeitstring;
    }

    public function bnbmerge($allData, $item) {
        if (!isset($item['base'])) {
            return $item;
        }
        else if (!isset($allData[$item['base']])) {
            return $item;
        }

        return array_merge($allData[$item['base']], $item);
    }
}