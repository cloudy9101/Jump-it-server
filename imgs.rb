#! /sh/bin/ruby
require 'json'

images = [
  "http://ww2.sinaimg.cn/large/006tNc79ly1g5xurzkq4yj31hc0u0tsz.jpg",
  "http://ww2.sinaimg.cn/large/006tNc79ly1g5xurguqhkj31900u07wk.jpg",
  "http://ww1.sinaimg.cn/large/006tNc79ly1g5xt85y3vtj31900u0b2a.jpg",
  "http://ww2.sinaimg.cn/large/006tNc79ly1g5xt68bdj3j30u018ynpd.jpg",
  "http://ww1.sinaimg.cn/large/006tNc79ly1g5xt5dvo1vj31900u0hdv.jpg",
  "http://ww1.sinaimg.cn/large/006tNc79ly1g5xrrk78gnj31900u04qs.jpg",
  "http://ww4.sinaimg.cn/large/006tNc79ly1g5xuvi67s1j31900u0u14.jpg",
  "http://ww1.sinaimg.cn/large/006tNc79ly1g5xvjt2f6ej31900u0e7j.jpg",
  "http://ww4.sinaimg.cn/large/006tNc79ly1g5xvkihhpaj31900u07wm.jpg",
  "http://ww1.sinaimg.cn/large/006tNc79ly1g5xvm5av84j31900u0x6p.jpg"
]

puts images[0]
file = open('./src/config/exercisesBase.json')
json = file.read
parsed = JSON.parse(json)
indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
['normal', 'lower', 'lowest'].each do |t|
  parsed[t].each do |day|
    ni = indexes.sample(day.count)
    day.each_with_index do |exer, index|
      exer['backgroundImg'] = images[ni[index]]
    end
  end
end

newFile = File.open('./src/config/exercises.json', 'w')
puts(JSON.unparse(parsed))
newFile.write(JSON.unparse(parsed))
newFile.close()
