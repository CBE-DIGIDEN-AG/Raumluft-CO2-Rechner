<?php
namespace App\Service;

class ManifestService
{
    private $manifestFile;

    public function __construct($manifestFile)
    {
        $this->manifestFile = $manifestFile;
    }

    public function get($key) {
        $content = file_get_contents($this->manifestFile);
        $manifest = json_decode($content);

        if ($key === '_all') {
            return $manifest;
        }

        return $manifest->{$key};
    }
}